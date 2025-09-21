import { fileTypeFromBuffer } from "file-type";
import { existsSync } from "fs";
import { mkdir, rename } from "fs/promises";
import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { dirname, join } from "path";
import sharp from "sharp";
import { openai as openaiConfig, storage } from "@/config";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { getCurrentFilename } from "@/lib/file";
import { optimization } from "@/lib/image";
import { scopeEnum } from "@/lib/schema/user";

const docroot = join(storage.root, "images");
const trashDocroot = join(storage.root, "images_trash");

export async function GET(req: NextRequest) {
  const uri = req.nextUrl.searchParams.get("uri");

  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query(
      `SELECT i.id
            , i.license
            , i.uri
            , i.portrait
            , i.size
            , i.width
            , i.height
            , i.name
            , i.author
            , i.ref
            , i."userId"
            , u.name AS "userName"
            , i.created
         FROM image i
        JOIN "user" u
          ON i."userId" = u.id
        WHERE i.deleted IS NULL
          ${uri ? "AND i.uri = $1" : ""}
     ORDER BY i.created DESC`,
      uri ? [uri] : undefined,
    );

    if (!rowCount) return new Response(null, { status: 404 });

    return Response.json(rows);
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const formData = await req.formData();

  const files = (formData.getAll("files") || []) as Array<File>;
  const authors = formData.getAll("author") || [];
  const licenses = formData.getAll("license") || [];
  const refs = formData.getAll("ref") || [];

  const saves = [];
  const values = [];
  const images = [];

  if (Array.from(files).some((file) => !(file instanceof File)))
    return new Response("Bad Request", { status: 400 });

  for (const file of files) {
    const buff = await file.arrayBuffer();
    const filetype = await fileTypeFromBuffer(buff);

    if (!filetype) continue;

    // for moderation
    const openai = new OpenAI(openaiConfig);
    const { results } = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: `data:${filetype.mime};base64,${Buffer.from(buff).toString("base64")}`,
          },
        },
      ],
    });

    if (results.some(({ flagged }) => flagged)) {
      const categories = results.reduce(
        (acc, { categories }) =>
          new Set(
            Array.from(acc).concat(
              Object.entries(categories)
                .filter(([, value]) => value)
                .map(([name]) => name),
            ),
          ),
        new Set<string>(),
      );

      return Response.json(Array.from(categories), { status: 415 });
    }

    images.push({ buff, name: file.name });
  }

  if (!images.length) return new Response("Bad Request", { status: 400 });

  if (authors.some((v) => !v)) return new Response("Author is required", { status: 400 });
  if (licenses.some((v) => !v)) return new Response("License is required", { status: 400 });

  if (authors.length !== files.length) return new Response("Bad Request", { status: 400 });
  if (licenses.length !== files.length) return new Response("Bad Request", { status: 400 });

  for (let i = 0, ilen = images.length; i < ilen; i++) {
    const { buff, name } = images[i];
    const author = authors[i] as string;
    const license = licenses[i] as string;

    const ref = (refs[i] as string | undefined)?.slice(0, 200) || null;
    const filetype = await fileTypeFromBuffer(buff);
    const original = sharp(buff);
    const filepath = await getCurrentFilename(docroot);

    const {
      isPortrait,
      originalSize: size,
      originalWidth: width,
      originalHeight: height,
    } = await optimization(filepath, original, { mime: filetype?.mime });

    const uri = filepath.replace(docroot, "");
    saves.push({ name, uri, width, height, author, ref });
    values.push(
      `('${uri}', ${isPortrait}, ${size}, ${width}, ${height}, '${author}', '${license}', '${ref}', '${name.replace(/\.[^.]+$/, ".webp")}', '${session.user.id}')`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO image (uri, portrait, size, width, height, author, license, ref, name, "userId") VALUES ${values.join(",")}`,
    );

    return Response.json(saves, { status: 201 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");

  if (!id) return new Response("Bad Request", { status: 400 });

  const client = await pool.connect();
  try {
    const {
      rows: [{ uri }],
    } = await client.query(
      `UPDATE image
          SET deleted = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $1
          AND deleted IS NULL
    RETURNING uri`,
      [id],
    );

    const pathname = join(trashDocroot, uri);

    if (!existsSync(pathname)) await mkdir(dirname(pathname), { recursive: true });

    await rename(join(docroot, uri), pathname);
    await rename(join(docroot, `${uri}-t`), `${pathname}-t`);
    await rename(join(docroot, `${uri}-o`), `${pathname}-o`);

    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
