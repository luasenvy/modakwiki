import type { NextMDXOptions } from "@next/mdx";
import LanguageBash from "highlight.js/lib/languages/bash";
import LanguageCSS from "highlight.js/lib/languages/css";
import LanguageDockerfile from "highlight.js/lib/languages/dockerfile";
import LanguageJava from "highlight.js/lib/languages/java";
import LanguageJavascript from "highlight.js/lib/languages/javascript";
import LanguageJson from "highlight.js/lib/languages/json";
import LanguagePlaintext from "highlight.js/lib/languages/plaintext";
import LanguageSql from "highlight.js/lib/languages/sql";
import LanguageTypescript from "highlight.js/lib/languages/typescript";
import LanguageXml from "highlight.js/lib/languages/xml";
import Link from "next/link";
import { Children } from "react";
import rehypeHighlight, { Options as HighlightOptions } from "rehype-highlight";
import rehypeHighlightCodeLines, { HighlightLinesOptions } from "rehype-highlight-code-lines";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import remarkHeadingId from "remark-heading-id";
import remarkSuperSub from "remark-supersub";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import remarkGfmTable from "@/lib/remark-gfm-table";
import { cn } from "@/lib/utils";

export const components = {
  Link,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) =>
    Children.toArray(props.children).some((child) =>
      // @ts-expect-error: i18next conflicts
      Boolean(child.props?.src),
    ) ? (
      props.children
    ) : (
      <p {...props} />
    ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
      <ImageZoom>
        <img {...props} loading="lazy" />
      </ImageZoom>
    );
  },
  sub: ({ children, ...props }: React.DelHTMLAttributes<HTMLElement>) => {
    return <sub {...props}>({children})</sub>;
  },
  table: ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
      <div className="max-h-96 overflow-auto rounded-none border">
        <table
          className={cn(
            "[&>thead>tr>th]:pt-2",
            "[&>thead>tr>th:first-child]:pl-2",
            "[&>thead>tr>th:last-child]:pr-2",
            "[&>tbody>tr>td:first-child]:pl-2",
            "[&>tbody>tr>td:last-child]:pr-2",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
};

export const mdxOptions: NextMDXOptions["options"] = {
  remarkPlugins: [
    remarkSuperSub,
    remarkGfmTable,
    [remarkHeadingId, { defaults: true, uniqueDefaults: false }],
    [remarkFlexibleCodeTitles, { tokenForSpaceInTitle: "^" }],
  ],
  rehypePlugins: [
    [
      rehypeHighlight,
      {
        languages: {
          dockerfile: LanguageDockerfile,
          bash: LanguageBash,
          css: LanguageCSS,
          java: LanguageJava,
          javascript: LanguageJavascript,
          json: LanguageJson,
          plaintext: LanguagePlaintext,
          sql: LanguageSql,
          typescript: LanguageTypescript,
          xml: LanguageXml,
          env() {
            return {
              contains: [
                {
                  className: "variable",
                  begin: /^[^=]+/,
                  relevance: 0,
                },
                {
                  className: "string",
                  begin: /=/,
                  end: /$/,
                  excludeBegin: true,
                  excludeEnd: true,
                  relevance: 0,
                },
              ],
            };
          },
        },
      } as HighlightOptions,
    ],
    [rehypeHighlightCodeLines, { showLineNumbers: true } as HighlightLinesOptions],
  ],
};
