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
import rehypeKatex from "rehype-katex";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import remarkHeadingId from "remark-heading-id";
import remarkSuperSub from "remark-supersub";
import remarkGfmFootnote from "@/lib/remark-gfm-footnote";
import remarkGfmTable from "@/lib/remark-gfm-table";
import remarkGfmTask from "@/lib/remark-gfm-task";
import remarkKatex from "@/lib/remark-katex";

export const remarkPlugins = [
  remarkSuperSub,
  remarkGfmTask,
  remarkGfmTable,
  remarkKatex,
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
  rehypeKatex,
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
