"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function SearchParamsScroller(props: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current) return;

    viewportRef.current.scrollTop = 0;
  }, [searchParams]);

  return <div ref={viewportRef} {...props} />;
}
