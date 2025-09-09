import { diffChars } from "diff";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  curr: string;
  prev: string;
}

export function DiffViewer({ curr, prev }: DiffViewerProps) {
  return (
    <pre>
      <code
        className={cn(
          "text-muted-foreground [&_del]:text-rose-600 [&_ins]:text-green-600",
          "w-full p-2",
          "text-sm",
        )}
      >
        {diffChars(prev, curr).map(({ added, removed, value }, i) =>
          removed ? (
            <del key={`diff-${i}`}>{value}</del>
          ) : added ? (
            <ins key={`diff-${i}`}>{value}</ins>
          ) : (
            <span key={`diff-${i}`}>{value}</span>
          ),
        )}
      </code>
    </pre>
  );
}
