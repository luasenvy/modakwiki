import "highlight.js/styles/vs2015.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import { MDXRemote } from "next-mdx-remote/rsc";

import { components, mdxOptions } from "@/lib/mdx-options";

export function MDXSimple({ source }: { source?: string }) {
  // biome-ignore lint/correctness/noUnusedVariables: omit components
  const { h2, h3, h4, h5, h6, ...compacts } = components;

  return !!source && <MDXRemote source={source} components={compacts} options={{ mdxOptions }} />;
}

export function MDXLoader({ source }: { source?: string }) {
  return !!source && <MDXRemote source={source} components={components} options={{ mdxOptions }} />;
}
