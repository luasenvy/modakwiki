import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import "katex/dist/katex.min.css";

import Markdown, { Options } from "react-markdown";

import mdxComponents from "@/components/mdx";

import { rehypePlugins, remarkPlugins } from "@/lib/mdx/utils";

export function MdxLoader({ children, ...props }: Options) {
  return (
    <Markdown
      components={mdxComponents}
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      {...props}
    >
      {children}
    </Markdown>
  );
}
