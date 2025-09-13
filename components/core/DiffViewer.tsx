import { diffChars } from "diff";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  curr: string;
  prev: string;
}

export function DiffViewer({ curr, prev }: DiffViewerProps) {
  return (
    <pre className="!p-2 !bg-zinc-900 !overflow-x-hidden !border-none">
      <code
        className={cn(
          "!text-muted-foreground [&_del]:text-rose-600 [&_ins]:text-green-600",
          "!text-sm",
          "!bg-zinc-900",
          "!whitespace-pre-wrap !break-keep",
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
