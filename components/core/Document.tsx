import { AlignLeft } from "lucide-react";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { getToc, MDXLoader } from "@/lib/mdx-parser";

interface DocumentProps {
  content: string;
}

export async function Document({ content }: DocumentProps) {
  const toc = getToc(content);

  return (
    <div className="relative flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full gap-4 overflow-auto p-4">
      <TOCProvider toc={toc} single={false}>
        <article className="prose dark:prose-invert max-w-full xl:max-w-[calc(100%_-_286px)]">
          <MDXLoader source={content} />
        </article>

        {toc.length > 0 && (
          <nav
            id="nav-toc"
            className="sticky top-[calc(var(--spacing)_*_12)] h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 pt-6 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
          >
            <div className="mb-2 flex items-center gap-2">
              <AlignLeft className="size-4" />
              <p className="m-0 text-muted-foreground text-sm">목차</p>
            </div>
            <TOCScrollArea className="overflow-auto p-0">
              <TocClerk />
            </TOCScrollArea>
          </nav>
        )}
      </TOCProvider>
    </div>
  );
}
