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
