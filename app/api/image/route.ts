import type { NextRequest } from "next/server";
import { join } from "path";
import sharp from "sharp";
import { storage } from "@/config";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { getCurrentFilename } from "@/lib/file";
import { optimization } from "@/lib/image";
import { scopeEnum } from "@/lib/schema/user";

const docroot = join(storage.root, "images");
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
      `INSERT INTO image (license, uri, portrait, size, name, userId) VALUES ${values.join(",")}`,
    );

    return Response.json(uris, { status: 201 });
  } finally {
    client.release();
  }
}
