import { Options as MdxOptions } from "@mdx-js/loader";

import { TOCItemType } from "fumadocs-core/server";

import LanguageBash from "highlight.js/lib/languages/bash";
import LanguageCSS from "highlight.js/lib/languages/css";
import LanguageDiff from "highlight.js/lib/languages/diff";
import LanguageDockerfile from "highlight.js/lib/languages/dockerfile";
import LanguageJava from "highlight.js/lib/languages/java";
import LanguageJavascript from "highlight.js/lib/languages/javascript";
import LanguageJson from "highlight.js/lib/languages/json";
import LanguagePlaintext from "highlight.js/lib/languages/plaintext";
import LanguageSql from "highlight.js/lib/languages/sql";
import LanguageTypescript from "highlight.js/lib/languages/typescript";
import LanguageXml from "highlight.js/lib/languages/xml";
import kebabcase from "lodash.kebabcase";

import rehypeHighlight, { Options as HighlightOptions } from "rehype-highlight";
import rehypeHighlightCodeLines, { HighlightLinesOptions } from "rehype-highlight-code-lines";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import remarkHeadingId from "remark-heading-id";
import remarkSuperSub from "remark-supersub";
import remarkGfmFootnote from "@/lib/remark-gfm-footnote";
import remarkGfmTable from "@/lib/remark-gfm-table";
import { cn } from "@/lib/utils";

export const remarkPlugins = [
  remarkSuperSub,
  remarkGfmTable,
  remarkGfmFootnote,
  [remarkHeadingId, { defaults: true, uniqueDefaults: false }],
  [remarkFlexibleCodeTitles, { tokenForSpaceInTitle: "^" }],
] satisfies MdxOptions["remarkPlugins"];

export const rehypePlugins = [
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
        diff: LanguageDiff,
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
] satisfies MdxOptions["rehypePlugins"];

export function getTocId(text: string) {
  if ("string" === typeof text) return `#${kebabcase(text.replace(/\\s+/g, " ").trim())}`;
  return "";
}

export function getToc(source: string): Array<TOCItemType> {
  return (source?.replace(/`{3}[^`]+`{3}|~{3}[^~]+~{3}/g, "").match(/^#[^\n]+/gm) ?? []).map(
    (head) => {
      const [, depth, text] = head.split(/(#+) ?/g);

      const title = text.trim();
      return {
        url: getTocId(title),
        title,
        depth: depth.length,
      } as TOCItemType;
    },
  );
}

export function getSelectedLine(textarea: HTMLTextAreaElement): string | null {
  const value = textarea.value;
  const selectionStart = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;

  if (selectionStart !== selectionEnd) {
    return value.substring(selectionStart, selectionEnd);
  } else {
    const curr = value.charAt(selectionStart);
    const prev = value.charAt(selectionStart - 1);

    if (!value.length) return null;

    if (/\n/.test(curr) && /\n|^$/.test(prev)) {
      return "";
    } else if (prev === "\n") {
      const least = value.substring(selectionStart).trim();
      return least.substring(0, least.search(/\n|$/));
    } else {
      let indicator = selectionStart;
      while (--indicator > 0 && !/\n|^$/.test(value.charAt(indicator)));

      const least = value.substring(indicator).trim();
      return least.substring(0, least.search(/\n|$/));
    }
  }
}

export const proseClassName = cn(
  "prose dark:prose-invert",
  "pr-2 pl-4",
  "break-keep",
  // Sub
  "[sub]:text-muted-foreground",
  // Link
  "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
  // Table
  "prose-table:m-0",
  "prose-td:[&>img]:m-auto",
  // Code
  "prose-pre:max-h-96",
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
  // footnote
  "[&>section.footnotes]:border-t [&>section.footnotes]:mt-24",
);
