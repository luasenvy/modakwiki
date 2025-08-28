import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import { TOCItemType } from "fumadocs-core/server";
import kebabcase from "lodash.kebabcase";
import { MDXRemote } from "next-mdx-remote/rsc";
import { components, mdxOptions } from "@/lib/mdx-options";

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

export function MDXLoader({ source }: { source?: string }) {
  return !!source && <MDXRemote source={source} components={components} options={{ mdxOptions }} />;
}
