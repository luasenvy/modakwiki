import type { NextRequest } from "next/server";
import { join } from "path";
import sharp from "sharp";
import { storage } from "@/config";
import { getCurrentFilename } from "@/lib/file";
import { optimization } from "@/lib/image";

const docroot = join(storage.root, "images");
export async function POST(req: NextRequest, ctx: RouteContext<"/api/file">) {
  const formData = await req.formData();

  const files = formData.getAll("files") || [];

  const sql = ["INSERT INTO image (license, uri, portrait, size, name) VALUES"];
  for (const file of files) {
    if (!(file instanceof File)) continue;

    // original
    const original = sharp(await file.arrayBuffer());
    const filepath = await getCurrentFilename(docroot);

    const { isPortrait, originalSize: size } = await optimization(filepath, original);
    const name = file.name.replace(/\.[^.]+$/, ".webp");

    sql.push(`('ccbysa', $1, ${isPortrait}, ${size}, $2),`);
  }

  console.info(files);

  return new Response(null, { status: 201 });
}
