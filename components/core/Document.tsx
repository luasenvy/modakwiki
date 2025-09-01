import { AlignLeft } from "lucide-react";
import { Container } from "@/components/core/Container";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { MdxLoader } from "@/lib/mdx/server";
import { getToc } from "@/lib/mdx/utils";
import { cn } from "@/lib/utils";

interface DocumentProps {
  content: string;
}

export async function Document({ content }: DocumentProps) {
  const toc = getToc(content);

  return (
    <TOCProvider toc={toc} single={false}>
      <Container>
        <article
          className={cn(
            "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
            "h-fit",
            "prose dark:prose-invert",
            "pt-8 pr-2 pb-24 pl-4 max-lg:pr-4",
            "break-keep",
            // Sub
            "[&_sub]:text-muted-foreground",
            // Link
            "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
            // Code
            "prose-pre:max-h-[calc(var(--spacing)_*_100)]",
            // Image
            "prose-img:w-full",
            "prose-img:[&[alt*=width-4]]:max-w-4",
            "prose-img:[&[alt*=width-8]]:max-w-8",
            "prose-img:[&[alt*=width-12]]:max-w-12",
            "prose-img:[&[alt*=width-16]]:max-w-16",
            "prose-img:[&[alt*=width-20]]:max-w-20",
            "prose-img:[&[alt*=width-24]]:max-w-24",
            "prose-img:[&[alt*=width-28]]:max-w-28",
            "prose-img:[&[alt*=width-32]]:max-w-32",
            "prose-img:[&[alt*=width-36]]:max-w-36",
            "prose-img:[&[alt*=width-40]]:!max-w-40", // Avoid Duplicate with w-4
            "prose-img:[&[alt*=width-3xs]]:max-w-3xs",
            "prose-img:[&[alt*=width-2xs]]:max-w-2xs",
            "prose-img:[&[alt*=width-xs]]:max-w-xs",
            "prose-img:[&[alt*=width-sm]]:max-w-sm",
            "prose-img:[&[alt*=width-md]]:max-w-md",
            "prose-img:[&[alt*=width-lg]]:max-w-lg",
            "prose-img:[&[alt*=width-xl]]:max-w-xl",
            "prose-img:[&[alt*=width-2xl]]:max-w-2xl",
            "prose-img:[&[alt*=width-3xl]]:max-w-3xl",
            "prose-img:[&[alt*=width-4xl]]:max-w-4xl",
            "prose-img:[&[alt*=width-5xl]]:max-w-5xl",
            "prose-img:[&[alt*=width-6xl]]:max-w-6xl",
            "prose-img:[&[alt*=width-7xl]]:max-w-7xl",
            "prose-img:[&[alt*=height-4]]:max-h-4",
            "prose-img:[&[alt*=height-8]]:max-h-8",
            "prose-img:[&[alt*=height-12]]:max-h-12",
            "prose-img:[&[alt*=height-16]]:max-h-16",
            "prose-img:[&[alt*=height-20]]:max-h-20",
            "prose-img:[&[alt*=height-24]]:max-h-24",
            "prose-img:[&[alt*=height-28]]:max-h-28",
            "prose-img:[&[alt*=height-32]]:max-h-32",
            "prose-img:[&[alt*=height-36]]:max-h-36",
            "prose-img:[&[alt*=height-40]]:!max-h-40", // Avoid Duplicate with h-4
            "prose-img:[&[alt*=height-3xs]]:max-h-3xs",
            "prose-img:[&[alt*=height-2xs]]:max-h-2xs",
            "prose-img:[&[alt*=height-xs]]:max-h-xs",
            "prose-img:[&[alt*=height-sm]]:max-h-sm",
            "prose-img:[&[alt*=height-md]]:max-h-md",
            "prose-img:[&[alt*=height-lg]]:max-h-lg",
            "prose-img:[&[alt*=height-xl]]:max-h-xl",
            "prose-img:[&[alt*=height-2xl]]:max-h-2xl",
            "prose-img:[&[alt*=height-3xl]]:max-h-3xl",
            "prose-img:[&[alt*=height-4xl]]:max-h-4xl",
            "prose-img:[&[alt*=height-5xl]]:max-h-5xl",
            "prose-img:[&[alt*=height-6xl]]:max-h-6xl",
            "prose-img:[&[alt*=height-7xl]]:max-h-7xl",
            // Task
            "prose-ol:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
            "prose-ul:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
            // Table
            "prose-table:m-0",
            "prose-td:[&>img]:m-auto",
            // footnote
            "[&>section.footnotes]:mt-24 [&>section.footnotes]:border-t",
            "prose-a:[&[data-footnote-ref]]:before:content-['[']",
            "prose-a:[&[data-footnote-ref]]:after:content-[']']",
          )}
        >
          <MdxLoader source={content} />
        </article>

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
      </Container>
    </TOCProvider>
  );
}
