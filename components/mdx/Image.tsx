"use client";

import { Info } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { statusMessage } from "@/lib/fetch/react";
import { byteto, fromNow } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/react";
import { licenseImageEnum, licenseLinkEnum } from "@/lib/license";
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

  let zoomImg;
  if ("string" === typeof props.src && props.src.endsWith("-t"))
    zoomImg = { src: props.src.slice(0, -1).concat("o") };

  return (
    <figure className="group relative w-fit border shadow-sm">
      <ImageZoom zoomImg={zoomImg} zoomMargin={40}>
        <img
          {...props}
          alt={altText}
          loading="lazy"
          className={cn(className, "!my-0 mx-auto")}
          style={{
            ...style,
            ...styles,
          }}
        />
      </ImageZoom>

      <figcaption
        className={cn(
          "absolute bottom-0 w-full",
          "opacity-0 transition-opacity duration-200 ease-linear group-hover:opacity-100",
          "bg-muted/95",
          "text-center font-light text-muted-foreground",
          "!m-0 p-2",
        )}
      >
        <p className="!m-0 !mr-auto text-center font-light">{altText}</p>
      </figcaption>

      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute top-1 right-1 size-5 shadow-md",
              "!border-amber-600 rounded-full",
              "shrink-0 text-amber-600",
            )}
          >
            <Info className="size-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <HoverCardContentImageDetail src={props.src as string} />
        </HoverCardContent>
      </HoverCard>
    </figure>
  );
}

interface HoverCardContentImageDetailProps {
  src: string;
}

export function HoverCardContentImageDetail({ src }: HoverCardContentImageDetailProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<ImageType>();

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/image?${new URLSearchParams({ uri: src.replace(/(^\/api\/image|-(o|t)$)/g, "") })}`,
      );

      if (!res.ok) return toast.error(statusMessage({ t, res }));

      const [item] = await res.json();
      setImage(item);
    })();
  }, [src]);

  return image ? (
    <div className="space-y-3">
      <h4 className="truncate font-semibold text-green-600" title={image.name}>
        {image.name}
      </h4>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("copyrighter")}</span>
          {image.ref ? (
            <a
              href={image.ref}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="font-medium">{image.author}</span>
            </a>
          ) : (
            <span className="font-medium">{image.author}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("resolution")}</span>
          <span className="font-medium">{`${image.width} x ${image.height}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("size")}</span>
          <span className="font-medium">{byteto(image.size)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("uploader")}</span>
          <span className="font-medium">{image.userName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("license")}</span>
          <a href={licenseLinkEnum[image.license]} target="_blank" rel="noreferrer noopener">
            <NextImage
              alt={image.license}
              src={licenseImageEnum[image.license]}
              height={25}
              width={71}
            />
          </a>
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
