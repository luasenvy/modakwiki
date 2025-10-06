import type { ReadStream } from "fs";
import { closeSync, openSync, PathLike, readSync, statSync } from "fs";
import { lookup } from "mime-types";
import { extname } from "path";

export function readChunk(filepath: PathLike, length: number) {
  let buffer = new Uint8Array(length);
  const descriptor = openSync(filepath, "r");

  try {
    const bytesRead = readSync(descriptor, buffer, { length });

    if (bytesRead < length) buffer = buffer.subarray(0, bytesRead);

    return buffer;
  } finally {
    closeSync(descriptor);
  }
}

export class ReadableStreamResponse extends Response {
  constructor(stream: ReadStream, init?: ResponseInit) {
    const filepath = stream.path as string;
    const { mtime } = statSync(filepath);

    const readable = new ReadableStream({
      async start(ctrl: ReadableStreamDefaultController) {
        const encoder = new TextEncoder();

        stream
          .on("data", (chunk) => {
            ctrl.enqueue(chunk instanceof Buffer ? chunk : encoder.encode(chunk.toString()));
          })
          .on("error", (err) => ctrl.error(err))
          .on("end", () => ctrl.close());
      },
    });

    const headers = init?.headers instanceof Headers ? init?.headers : new Headers(init?.headers);

    if (!headers.get("Content-Type"))
      headers.set("Content-Type", lookup(extname(filepath)) || "application/octet-stream");

    headers.set("Last-Modified", mtime.toUTCString());
    headers.set("Transfer-Encoding", "chunked");

    super(readable, {
      ...init,
      headers,
    });
  }
}
