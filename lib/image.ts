import type { FileTypeResult } from "file-type";
import { readFile } from "fs/promises";
import { basename, dirname, extname, join } from "path";
import sharp, { Sharp } from "sharp";

export interface OptimizationOptions {
  ext?: boolean;
  mime?: FileTypeResult["mime"];
}

export async function optimization(
  filepath: string,
  original: Sharp,
  options?: OptimizationOptions,
) {
  if (!original) original = sharp(await readFile(filepath));

  original.withMetadata();
  if ("image/webp" !== options?.mime) original.webp({ quality: 80 });

  const {
    size: originalSize,
    width: originalWidth,
    height: originalHeight,
  } = await original.toFile(filepath);

  const ename = extname(filepath);
  const bname = basename(filepath, ename);

  // optimize
  const optimize = original.clone();

  const { width, height } = await optimize.metadata();
  const isPortrait = height > width;

  if (width > 1280) {
    const { height } = await sharp(
      await optimize.resize({ width: 1280, fit: "inside" }).clone().toBuffer(),
    ).metadata();
    if (height > 720) optimize.resize({ height: 720, fit: "inside" });
  } else if (height > 720) optimize.resize({ height: 720, fit: "inside" });

  await optimize.toFile(join(dirname(filepath), `${bname}-o${options?.ext ? ename : ""}`));

  // thumbnail from original
  const thumbnail = optimize.clone();

  if (width > 480) {
    const { height } = await sharp(
      await thumbnail.resize({ width: 480, fit: "inside" }).clone().toBuffer(),
    ).metadata();
    if (height > 320) thumbnail.resize({ height: 320, fit: "inside" });
  } else if (height > 320) thumbnail.resize({ height: 320, fit: "inside" });

  await thumbnail.toFile(join(dirname(filepath), `${bname}-t${options?.ext ? ename : ""}`));

  return { isPortrait, originalSize, originalWidth, originalHeight };
}
