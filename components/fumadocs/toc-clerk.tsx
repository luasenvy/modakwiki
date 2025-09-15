"use client";

import type { TOCItemType } from "fumadocs-core/server";
import * as Primitive from "fumadocs-core/toc";
import { mergeRefs } from "fumadocs-ui/utils/merge-refs";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { useTOCItems } from "@/components/fumadocs/toc";
import { TocThumb } from "@/components/fumadocs/toc-thumb";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

export interface ClerkTOCItemsProps extends ComponentProps<"div"> {
  lng: Language;
}

export default function ClerkTOCItems({
  ref,
  lng: lngParam,
  className,
  ...props
}: ClerkTOCItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();

  const [svg, setSvg] = useState<{
    path: string;
    width: number;
    height: number;
  }>();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    function onResize(): void {
      if (container.clientHeight === 0) return;
      let w = 0,
        h = 0;
      const d: string[] = [];
      for (let i = 0; i < items.length; i++) {
        const element: HTMLElement | null = container.querySelector(
          `a[href="#${items[i].url.slice(1)}"]`,
        );
        if (!element) continue;

        const styles = getComputedStyle(element);
        const offset = getLineOffset(items[i].depth) + 1,
          top = element.offsetTop + parseFloat(styles.paddingTop),
          bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom);

        w = Math.max(offset, w);
        h = Math.max(h, bottom);

        d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`);
        d.push(`L${offset} ${bottom}`);
      }

      setSvg({
        path: d.join(" "),
        width: w + 1,
        height: h,
      });
    }

    const observer = new ResizeObserver(onResize);
    onResize();

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [items]);

  const { t } = useTranslation(lngParam);
  if (items.length === 0)
    return (
      <div className="rounded-lg border bg-card p-3 text-muted-foreground text-xs">
        {t("No Headings")}
      </div>
    );

  return (
    <>
      {svg ? (
        <div
          className="rtl:-scale-x-100 absolute start-0 top-0"
          style={{
            width: svg.width,
            height: svg.height,
            maskImage: `url("data:image/svg+xml,${
              // Inline SVG
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="1" fill="none" /></svg>`,
              )
            }")`,
          }}
        >
          <TocThumb
            containerRef={containerRef}
            className="mt-(--fd-top) h-(--fd-height) bg-primary transition-all"
          />
        </div>
      ) : null}
      <div ref={mergeRefs(containerRef, ref)} className={cn("flex flex-col", className)} {...props}>
        {items.map((item, i) => (
          <TOCItem
            key={item.url}
            item={item}
            upper={items[i - 1]?.depth}
            lower={items[i + 1]?.depth}
          />
        ))}
      </div>
    </>
  );
}

function getItemOffset(depth: number): number {
  if (depth <= 2) return 14;
  if (depth === 3) return 26;
  return 36;
}

function getLineOffset(depth: number): number {
  return depth >= 3 ? 10 : 0;
}

function TOCItem({
  item,
  upper = item.depth,
  lower = item.depth,
}: {
  item: TOCItemType;
  upper?: number;
  lower?: number;
}) {
  const offset = getLineOffset(item.depth),
    upperOffset = getLineOffset(upper),
    lowerOffset = getLineOffset(lower);

  return (
    <Primitive.TOCItem
      href={item.url}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
      className="prose relative py-1.5 text-muted-foreground text-sm transition-colors [overflow-wrap:anywhere] first:pt-0 last:pb-0 hover:text-accent-foreground data-[active=true]:text-primary"
    >
      {offset !== upperOffset ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          className="-top-1.5 rtl:-scale-x-100 absolute start-0 size-4"
        >
          <line
            x1={upperOffset}
            y1="0"
            x2={offset}
            y2="12"
            className="stroke-foreground/10"
            strokeWidth="1"
          />
        </svg>
      ) : null}
      <div
        className={cn(
          "absolute inset-y-0 w-px bg-foreground/10",
          offset !== upperOffset && "top-1.5",
          offset !== lowerOffset && "bottom-1.5",
        )}
        style={{
          insetInlineStart: offset,
        }}
      />
      {item.title}
    </Primitive.TOCItem>
  );
}
