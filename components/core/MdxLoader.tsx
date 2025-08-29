import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import { MDXRemote } from "next-mdx-remote/rsc";
import components from "@/components/mdx";
import { rehypePlugins, remarkPlugins } from "@/lib/mdx";

export function MDXLoader({ source }: { source?: string }) {
  return (
    !!source && (
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            rehypePlugins,
            remarkPlugins,
          },
        }}
      />
    )
  );
}
