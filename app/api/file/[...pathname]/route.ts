import { fileTypeFromBuffer } from "file-type";
import { createReadStream, existsSync } from "fs";
import type { NextRequest } from "next/server";
import { join } from "path";
import { storage } from "@/config";
import { ReadableStreamResponse, readChunk } from "@/lib/stream";
import { unwrap } from "@/lib/url";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/file/[...pathname]">) {
  const { pathname } = await ctx.params;
  const q = req.nextUrl.searchParams.get("q");

  if (pathname.length <= 0 || pathname.includes("_photobook_"))
    return new Response("Not Found", { status: 404 });

  if (q) pathname.push(pathname.pop()!.concat(`-${q}`));

  const filepath = join(storage.root, unwrap(pathname.join("/")));

  if (!existsSync(filepath)) return new Response("Not Found", { status: 404 });

  const chunk = readChunk(filepath, 1024);
  const ftype = await fileTypeFromBuffer(chunk);

  return new ReadableStreamResponse(createReadStream(filepath), {
    headers: {
      "Content-Type": ftype?.mime || "application/octet-stream",
    },
  });
}
