import { Options as MdxOptions } from "@mdx-js/loader";

import { TOCItemType } from "fumadocs-core/server";

import LanguageBash from "highlight.js/lib/languages/bash";
import LanguageCSS from "highlight.js/lib/languages/css";
import LanguageDiff from "highlight.js/lib/languages/diff";
import LanguageDockerfile from "highlight.js/lib/languages/dockerfile";
import LanguageJava from "highlight.js/lib/languages/java";
import LanguageJavascript from "highlight.js/lib/languages/javascript";
import LanguageJson from "highlight.js/lib/languages/json";
import LanguageMarkdown from "highlight.js/lib/languages/markdown";
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
import remarkAlert from "@/lib/mdx/remark/remark-alert";
import remarkGfmFootnote from "@/lib/mdx/remark/remark-gfm-footnote";
import remarkGfmTable from "@/lib/mdx/remark/remark-gfm-table";
import remarkGfmTask from "@/lib/mdx/remark/remark-gfm-task";
import remarkKatex from "@/lib/mdx/remark/remark-katex";
import remarkYoutube from "@/lib/mdx/remark/remark-youtube";

export const remarkPlugins = [
  remarkSuperSub,
  remarkGfmTask,
  remarkGfmTable,
  remarkKatex,
  remarkAlert,
  remarkYoutube,
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
        markdown: LanguageMarkdown,
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
        const footnoteIdentifiers = hunk.match(/\[\^[^\]]+](?=[^:]|\s|$)/g);

        if (footnoteIdentifiers) {
          hunk += "\n";
          for (const footnoteIdentify of footnoteIdentifiers) {
            const footnoteIndicator = content.search(
              new RegExp(`\n${footnoteIdentify.replace(/(\[|\]|\^)/g, "\\$1")}:[^\n$]+`),
            );

            if (footnoteIndicator < 0) continue;

            let endOfFootnote = content.indexOf("\n", footnoteIndicator + 1);
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

export function trailingFootnotes(content: string) {
  const regex = /\[\^[^\]]+]:[^\n|$]+/g;
  const footnotes = content.match(regex);

  if (footnotes?.length) return content.replace(regex, "").concat(`\n\n${footnotes.join("\n")}`);

  return content;
}

export function clear(content: string) {
  return content.replace(/\n{3,}/g, "\n\n").trim();
}

export function humanReadable(content: string) {
  // remove youtubes
  content = content.replace(/^@\[[^\]]+\]/gm, "");

  // remove alerts
  content = content.replace(/^![^\n$]+(\n|$)/gm, "");

  // remove footnotes
  content = content.replace(/\[\^[^\]]+](:[^\n|$]+)?/g, "");

  // remove sub
  content = content.replace(/~([^\n]+)~/g, "$1");

  // remove sup
  content = content.replace(/\^([^\n]+)\^/g, "$1");

  // remove blockquotes
  content = content.replace(/(^|\n)> /g, " ");

  // remove headings
  content = content.replace(/^#[^\n]+/gm, "");

  // remove horizontal
  content = content.replace(/^(\*|-|\+){3,}(\n|$)/gm, "");

  // remove list
  content = content.replace(/^(\*|-|\+)[^\n]+/g, "");

  // unwrap links
  content = content.replace(/\[([^\]]+)]\([^)]+\)/g, "$1");

  // remove blocks
  const blocktypes = ["```", "~~~", "$$"];
  let indicator;
  for (const blocktype of blocktypes) {
    while ((indicator = content.indexOf(blocktype)) >= 0) {
      content = content.substring(
        indicator,
        content.indexOf(blocktype, indicator + blocktype.length),
      );
    }
  }

  // remove tables
  while ((indicator = content.search(/(^|\n)\|/)) >= 0) {
    const endOfTable = content.indexOf("|\n\n", indicator + 1);

    if (endOfTable < 0) break;

    content = content.substring(0, indicator) + content.substring(endOfTable + 1);
  }

  // remove whitespaces
  content = content.replace(/\s{2,}|\n/g, " ").trim();

  return content;
}
