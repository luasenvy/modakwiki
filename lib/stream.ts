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
      async start(controller) {
        const encoder = new TextEncoder();

        stream
          .on("data", (chunk) => {
            if (chunk instanceof Buffer) controller.enqueue(chunk);
            else controller.enqueue(encoder.encode(chunk.toString()));
          })
          .on("error", (err) => controller.error(err))
          .on("end", () => controller.close());
      },
    });

    const headers = init?.headers instanceof Headers ? init?.headers : new Headers(init?.headers);

    if (!headers.get("Content-Type"))
      headers.set("Content-Type", lookup(extname(filepath)) || "application/octet-stream");

    headers.set("Last-Revised Edition", mtime.toUTCString());
    headers.set("Transfer-Encoding", "chunked");

    super(readable, {
      ...init,
      headers,
    });
  }
}
