"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Image({
  alt = "",
  style,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [text, ...others] = alt?.split(" ") ?? [];

  const otherTexts = others
    .filter((item) => !/^width-(.+)$/.test(item) && !/^height-(.+)$/.test(item))
    .join(" ");

  const [, width] = others.find((item) => /^width-(.+)$/.test(item))?.match(/^width-(.+)$/) || [];
  const [, height] =
    others.find((item) => /^height-(.+)$/.test(item))?.match(/^height-(.+)$/) || [];

  const styles: React.CSSProperties = {};
  let classes: React.ImgHTMLAttributes<HTMLImageElement>["className"] = "";

  if (width) {
    if (Number.isFinite(Number(width))) styles.maxWidth = `${width}px`;
    else classes += ` ${width}`;
  }
  if (height) {
    if (Number.isFinite(Number(height))) styles.maxHeight = `${height}px`;
    else classes += ` ${height}`;
  }

  const altText = [text, otherTexts].join(" ");
  return (
    <figure className="relative flex w-auto flex-col border shadow-sm">
      <img
        {...props}
        alt={altText}
        loading="lazy"
        className={cn(className, classes, "mx-auto")}
        style={{
          ...style,
          ...styles,
        }}
      />
      <figcaption
        className={cn(
          "absolute bottom-0 w-full",
          "bg-muted/80 text-muted-foreground",
          "flex items-center",
          "font-light",
          "!m-0 p-2",
        )}
      >
        <p className="!m-0 !mr-auto text-center font-light">{altText}</p>

        <a href="#">
          <Info className="size-4 shrink-0" />
        </a>
      </figcaption>
    </figure>
  );
}
