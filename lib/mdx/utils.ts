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

function getEnterIndex(value: string, indicator: number, direction: "prev" | "next") {
  const regex = /\n{2,}|^$/;
  while (indicator > 0 || indicator < value.length) {
    if (direction === "prev") {
      if (regex.test(value.substring(indicator - 2, indicator))) break;
      indicator--;
    } else {
      if (regex.test(value.substring(indicator, indicator + 2))) break;
      indicator++;
    }
  }

  return indicator;
}

export function getSelectedHunk(textarea: HTMLTextAreaElement) {
  const value = textarea.value;
  const selectionStart = textarea.selectionStart;
  const selectionEnd = textarea.selectionEnd;

  const startOfHunk = getEnterIndex(textarea.value, selectionStart, "prev");
  const endOfHunk = getEnterIndex(textarea.value, selectionEnd, "next");

  return value.substring(startOfHunk, endOfHunk);
}

export function getHunks(content: string) {
  const lines = [];

  let indicator = 0;
  while (indicator < content.length) {
    if (content.startsWith("```", indicator)) {
      let endOfHunk = content.indexOf("```", indicator + 3);

      // syntax
      if (endOfHunk < 0) endOfHunk = content.length;
      else endOfHunk += 3;

      lines.push(content.substring(indicator, endOfHunk));
      indicator = endOfHunk;
    } else if (content.startsWith("$$", indicator)) {
      let endOfHunk = content.indexOf("$$", indicator + 2);

      // syntax
      if (endOfHunk < 0) endOfHunk = content.length;
      else endOfHunk += 2;

      lines.push(content.substring(indicator, endOfHunk));
      indicator = endOfHunk;
    } else {
      let endOfHunk = content.indexOf("\n\n", indicator + 2);

      if (endOfHunk < 0) {
        // End of Document
        endOfHunk = content.length;

        lines.push(content.substring(indicator, endOfHunk).trim());
        indicator = endOfHunk;
      } else {
        // Paragraph
        endOfHunk += 2;
        let hunk = content.substring(indicator, endOfHunk).trim();

        // If paragraph has footnotes
        // Find footnote in Document and Append to paragraph
        const footnoteIndicators = hunk.match(/\[\^[^\]]+\]/g);
        if (footnoteIndicators) {
          hunk += "\n";
          for (const footnoteIdentify of footnoteIndicators) {
            const footnoteIndicator = content.search(
              new RegExp(`\n${footnoteIdentify.replace(/(\[|\]|\^)/g, "\\$1")}:[^\n$]+`),
            );

            if (footnoteIndicator < 0) continue;

            let endOfFootnote = content.indexOf("\n", footnoteIndicator + 1);
            console.info(footnoteIdentify, footnoteIndicator, endOfFootnote);
            if (endOfFootnote < 0) endOfFootnote = content.length;

            hunk += content.substring(footnoteIndicator, endOfFootnote);

            // No more need footnote on content
            content = content.substring(0, footnoteIndicator) + content.substring(endOfFootnote);
          }
        }

        lines.push(hunk);
        indicator = endOfHunk;
      }
    }
  }

  return lines;
}
