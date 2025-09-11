import { existsSync } from "fs";
import { mkdir, rename } from "fs/promises";
import type { NextRequest } from "next/server";
import { dirname, join } from "path";
import sharp from "sharp";
import { storage } from "@/config";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { getCurrentFilename } from "@/lib/file";
import { optimization } from "@/lib/image";
import { scopeEnum } from "@/lib/schema/user";

const docroot = join(storage.root, "images");
const trashDocroot = join(storage.root, "images_trash");

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id
            , license
            , uri
            , portrait
            , size
            , name
            , "userId"
            , created
         FROM image
        WHERE deleted IS NULL
     ORDER BY created DESC`,
    );

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

  const files = formData.getAll("files") || [];

  const uris = [];
  const values = [];
  for (const file of files) {
    if (!(file instanceof File)) continue;

    const original = sharp(await file.arrayBuffer());
    const filepath = await getCurrentFilename(docroot);

    const { isPortrait, originalSize: size } = await optimization(filepath, original);

    const uri = filepath.replace(docroot, "");
    uris.push(uri);
    values.push(
      `('ccbysa', '${uri}', ${isPortrait}, ${size}, '${file.name.replace(/\.[^.]+$/, ".webp")}', '${session.user.id}')`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO image (license, uri, portrait, size, name, "userId") VALUES ${values.join(",")}`,
    );

    return Response.json(uris, { status: 201 });
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
