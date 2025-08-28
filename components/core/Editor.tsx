"use client";

import debounce from "lodash.debounce";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { components as mdxComponents, mdxOptions } from "@/lib/mdx-options";

interface EditorProps {
  lng: Language;
}

export function Editor({ lng: lngParam }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation(lngParam);
  const [markdown, setMarkdown] = useState<string>("");
  const lineRef = useRef<string | null | undefined>(undefined);
  const [_, setLineChange] = useState<number>(0);

  const syncMarkdownPreview = debounce(() => {
    const value = textareaRef.current!.value;
    const selectionStart = textareaRef.current!.selectionStart;
    const selectionEnd = textareaRef.current!.selectionEnd;
    const prevLine = lineRef.current;

    if (selectionStart !== selectionEnd) {
      lineRef.current = null;
    } else {
      const curr = value.charAt(selectionStart);
      const prev = value.charAt(selectionStart - 1);

      if (/\n/.test(curr) && /\n|^$/.test(prev)) {
        lineRef.current = "";
      } else if (prev === "\n") {
        const least = value.substring(selectionStart).trim();
        lineRef.current = least.substring(0, least.search(/\n|$/));
      } else {
        let indicator = selectionStart;
        while (--indicator > 0 && !/\n|^$/.test(value.charAt(indicator)));

        const least = value.substring(indicator).trim();
        console.info(least);
        lineRef.current = least.substring(0, least.search(/\n|$/));
      }
    }

    if (!value.length) lineRef.current = undefined;

    if (prevLine !== lineRef.current) setLineChange((prev) => prev + 1);
  }, 300);

  const handleKeyUpMarkdown = syncMarkdownPreview;

  const handleClickMarkdown = handleKeyUpMarkdown;

  return (
    <>
      <Textarea
        ref={textareaRef}
        className="h-56 resize-none"
        placeholder="Please input markdown here..."
        defaultValue={markdown}
        onKeyUp={handleKeyUpMarkdown}
        onClick={handleClickMarkdown}
        onChange={(e) => setMarkdown(e.target.value)}
      />

      {lineRef.current === undefined ? (
        <p className="text-muted-foreground">{t("Please input markdown")}</p>
      ) : lineRef.current === null ? (
        <p className="text-muted-foreground">{t("Selecting area")}</p>
      ) : (
        <Markdown
          components={mdxComponents}
          remarkPlugins={mdxOptions.remarkPlugins}
          rehypePlugins={mdxOptions.rehypePlugins}
        >
          {lineRef.current}
        </Markdown>
      )}
    </>
  );
}
