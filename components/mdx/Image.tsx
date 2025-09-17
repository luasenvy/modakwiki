"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Image({ alt = "", style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [text, ...others] = alt?.split(" ") ?? [];

  const otherTexts = others
    .filter((item) => !/^width-(\d+)$/.test(item) && !/^height-(\d+)$/.test(item))
    .join(" ");
  const width = Number(others.find((item) => /^width-(\d+)$/.test(item))?.replace("width-", ""));
  const height = Number(others.find((item) => /^height-(\d+)$/.test(item))?.replace("height-", ""));

  const altText = [text, otherTexts].join(" ");
  return (
    <figure className="relative w-auto border shadow-sm">
      <img
        {...props}
        alt={altText}
        loading="lazy"
        style={{
          ...style,
          width: Number.isFinite(width) ? width : undefined,
          height: Number.isFinite(height) ? height : undefined,
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
