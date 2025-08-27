import { AlignLeft } from "lucide-react";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { getToc, MDXLoader } from "@/lib/mdx-parser";
import { cn } from "@/lib/utils";

interface DocumentProps {
  content: string;
}

export async function Document({ content }: DocumentProps) {
  const toc = getToc(content);

  return (
    <div className="relative flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full overflow-auto">
      <TOCProvider toc={toc} single={false}>
        <article
          className={cn(
            "prose dark:prose-invert",
            "h-auto max-w-full grow p-4 xl:max-w-[calc(100%_-_286px)]",
            "h-fit break-keep pb-24",
            // Link
            "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
            // Table
            "prose-table:m-0",
            // Code
            "prose-pre:max-h-96",
          )}
        >
          <MDXLoader source={content} />
        </article>

        {toc.length > 0 && (
          <nav
            id="nav-toc"
            className="sticky top-0 h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 pt-4 pl-4 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
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
