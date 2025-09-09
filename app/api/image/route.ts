import type { NextRequest } from "next/server";
import { join } from "path";
import sharp from "sharp";
import { storage } from "@/config";
import { pool } from "@/lib/db";
import { getCurrentFilename } from "@/lib/file";
import { optimization } from "@/lib/image";

const docroot = join(storage.root, "images");
export async function POST(req: NextRequest, ctx: RouteContext<"/api/image">) {
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
      `('ccbysa', '${uri}', ${isPortrait}, ${size}, '${file.name.replace(/\.[^.]+$/, ".webp")}')`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO image (license, uri, portrait, size, name) VALUES ${values.join(",")}`,
    );

    return Response.json(uris, { status: 201 });
  } finally {
    client.release();
  }
}
