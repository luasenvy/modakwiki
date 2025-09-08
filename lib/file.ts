import { randomBytes } from "crypto";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";

export async function getCurrentFilename(docroot: string) {
  const currDate = new Date();

  const relativePath = `${currDate.getFullYear()}/${currDate.getMonth() + 1}/${currDate.getDate()}/${currDate.getHours()}`;
  const pathname = join(docroot, relativePath);

  const filename = randomBytes(16).toString("hex");

  if (!existsSync(pathname)) await mkdir(pathname, { recursive: true });

  return join(pathname, filename);
}
