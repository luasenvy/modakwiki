import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import "katex/dist/katex.min.css";

import { EvaluateOptions, evaluate } from "@mdx-js/mdx";
import { MDXContent } from "mdx/types";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import MDXComponents from "@/components/mdx";
import { escapeTextForBrowser } from "@/lib/html";
import { rehypePlugins, remarkPlugins } from "@/lib/mdx/utils";

interface MdxLoaderProps {
  source: string;
}

const runtime: EvaluateOptions = {
  jsx,
  jsxs,
  Fragment,
  remarkPlugins,
  rehypePlugins,
};

export function MdxLoader({ source }: MdxLoaderProps) {
  const [MdxContent, setMdxContent] = useState<MDXContent>(() => () => <div>Loading...</div>);
  useEffect(() => {
    evaluate(escapeTextForBrowser(source), runtime).then((mod) => setMdxContent(() => mod.default));
  }, [source]);

  return <MdxContent components={MDXComponents} />;
}
