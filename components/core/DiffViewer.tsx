"use client";

import { diffChars } from "diff";
import { useMemo } from "react";
import { MdxLoader } from "@/lib/mdx/react";

interface DiffViewerProps {
  curr: string;
  prev: string;
}

export function DiffViewer({ curr, prev }: DiffViewerProps) {
  const diffs = useMemo(() => diffChars(prev, curr), [curr, prev]);

  return (
    <MdxLoader>
      {`~~~diff\n${diffs
        .map(({ added, removed, value }, i) =>
          added
            ? `+ ${value.replace(/(\n)/g, "$1+ ")}`
            : removed
              ? `- ${value.replace(/(\n)/g, "$1- ")}`
              : value,
        )
        .join("\n")}\n~~~`}
    </MdxLoader>
  );
}
