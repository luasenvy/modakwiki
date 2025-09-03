"use client";

import { diffChars } from "diff";
import { useEffect, useMemo, useRef } from "react";

interface DiffViewerProps {
  curr: string;
  prev: string;
}

export function DiffViewer({ curr, prev }: DiffViewerProps) {
  return (
    <div>
      <pre>
        {diffChars(curr, prev).map(({ added, removed, value }, i) => (
          <span key={`diff-${i}`} style={{ color: added ? "green" : removed ? "red" : "grey" }}>
            {value}
            {/* {added
              ? value.replace(/(^|\n)/g, "$1+ ")
              : removed
                ? value.replace(/(^|\n)/g, "$1- ")
                : value} */}
          </span>
        ))}
      </pre>
    </div>
  );
}
