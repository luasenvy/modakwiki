import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import "katex/dist/katex.min.css";

import { EvaluateOptions, evaluate } from "@mdx-js/mdx";
import { MDXContent } from "mdx/types";
import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import MDXComponents from "@/components/mdx";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
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
  const [MdxContent, setMdxContent] = useState<MDXContent>(() => () => (
    <div className="flex py-4">
      <Spinner className="m-auto" variant="ring" size={32} />
    </div>
  ));

  useEffect(() => {
    const isPre = ((source) => {
      if (source.startsWith("```") && source.endsWith("```")) return true;
      if (source.startsWith("~~~") && source.endsWith("~~~")) return true;
      if (source.startsWith("$$") && source.endsWith("$$")) return true;

      return false;
    })(source);

    if (!isPre) {
      let escapes = "";
      let cursor;
      while ((cursor = source.indexOf("`")) >= 0) {
        const endCursor = source.indexOf("`", cursor + 1) + 1;

        escapes += escapeTextForBrowser(source.substring(0, cursor));
        escapes += source.substring(cursor, endCursor);

        source = source.substring(endCursor);
      }

      escapes += source;
      source = escapes;
    }

    evaluate(source, runtime).then((mod) => setMdxContent(() => mod.default));
  }, [source]);

  return <MdxContent components={MDXComponents} />;
}
