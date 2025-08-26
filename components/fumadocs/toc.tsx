"use client";
import type { TOCItemType } from "fumadocs-core/server";
import * as Primitive from "fumadocs-core/toc";
import { mergeRefs } from "fumadocs-ui/utils/merge-refs";
import { type ComponentProps, createContext, useContext, useRef } from "react";
import { TocThumb } from "@/components/fumadocs/toc-thumb";
import { cn } from "@/lib/utils";

const TOCContext = createContext<TOCItemType[]>([]);

export function useTOCItems(): TOCItemType[] {
  return useContext(TOCContext);
}

export function TOCProvider({
  toc,
  children,
  ...props
}: ComponentProps<typeof Primitive.AnchorProvider>) {
  return (
    <TOCContext value={toc}>
      <Primitive.AnchorProvider toc={toc} {...props}>
        {children}
      </Primitive.AnchorProvider>
    </TOCContext>
  );
}

export function TOCScrollArea({ ref, className, ...props }: ComponentProps<"div">) {
  const viewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={mergeRefs(viewRef, ref)}
      className={cn(
        "relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]",
        className,
      )}
      {...props}
    >
      <Primitive.ScrollProvider containerRef={viewRef}>{props.children}</Primitive.ScrollProvider>
    </div>
  );
}
