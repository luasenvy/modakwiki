import { AlignLeft } from "lucide-react";
import { MDXLoader } from "@/components/core/MdxLoader";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { getToc, proseClassName } from "@/lib/mdx";
import { cn } from "@/lib/utils";

interface DocumentProps {
  content: string;
}

export async function Document({ content }: DocumentProps) {
  const toc = getToc(content);

  return (
    <TOCProvider toc={toc} single={false}>
      <article
        className={cn(
          proseClassName,
          "relative max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
          "h-fit pt-8 pb-24",
        )}
      >
        <MDXLoader source={content} />
      </article>

      {toc.length > 0 && (
        <nav
          id="nav-toc"
          className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
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
  );
}
