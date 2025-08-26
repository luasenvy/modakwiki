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
import { Options } from "react-markdown";
import rehypeHighlight, { Options as HighlightOptions } from "rehype-highlight";
import rehypeHighlightCodeLines, { HighlightLinesOptions } from "rehype-highlight-code-lines";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import remarkGfm from "remark-gfm";
import remarkHeadingId from "remark-heading-id";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

export const components = {
  Link,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
      <ImageZoom>
        <img {...props} loading="lazy" />
      </ImageZoom>
    );
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => {
    return (
      <div className="mt-8 max-h-96 overflow-auto rounded-lg border px-2 py-1">
        <table className="m-0" {...props} />
      </div>
    );
  },
};

export const mdxOptions: Options = {
  remarkPlugins: [
    remarkGfm,
    [remarkHeadingId, { defaults: true, uniqueDefaults: false }],
    remarkFlexibleCodeTitles,
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
