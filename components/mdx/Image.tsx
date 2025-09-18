"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { byteto, fromNow } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/react";
import { Image as ImageType } from "@/lib/schema/image";
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

  if (width && Number.isFinite(Number(width))) styles.maxWidth = `${width}px`;
  if (height && Number.isFinite(Number(height))) styles.maxHeight = `${height}px`;

  const altText = [text, otherTexts].join(" ");
  return (
    <figure className="flex w-auto flex-col border shadow-sm">
      <img
        {...props}
        alt={altText}
        loading="lazy"
        className={cn(className, "mx-auto")}
        style={{
          ...style,
          ...styles,
        }}
      />
      <figcaption
        className={cn(
          "bg-muted/80 text-muted-foreground",
          "flex items-center",
          "font-light",
          "!m-0 p-2",
        )}
      >
        <p className="!m-0 !mr-auto text-center font-light">{altText}</p>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="shrink-0 text-blue-600">
              <Info className="size-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <HoverCardContentImageDetail src={props.src as string} />
          </HoverCardContent>
        </HoverCard>
      </figcaption>
    </figure>
  );
}

interface HoverCardContentImageDetailProps {
  src: string;
}

function HoverCardContentImageDetail({ src }: HoverCardContentImageDetailProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<ImageType>();

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/image?${new URLSearchParams({ uri: src.replace(/^\/api\/image/, "") })}`,
      );

      const [item] = await res.json();
      setImage(item);
    })();
  }, [src]);

  return image ? (
    <div className="space-y-3">
      <h4 className="font-semibold text-green-600">{image.name}</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Copyrighter")}</span>
          <span className="font-medium">-----</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Resolution")}</span>
          <span className="font-medium">{`${image.width} x ${image.height}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Size")}</span>
          <span className="font-medium">{byteto(image.size)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("Uploader")}</span>
          <span className="font-medium">{image.userName}</span>
        </div>
      </div>
      <div className="border-t pt-2 text-right text-muted-foreground text-xs">
        {t("Created")}: {fromNow(image.created)}
      </div>
    </div>
  ) : (
    <Spinner className="m-auto" variant="ring" size={32} />
  );
}
