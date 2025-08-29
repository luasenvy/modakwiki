"use client";

import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import debounce from "lodash.debounce";
import { AlignLeft } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import mdxComponents from "@/components/mdx";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { getSelectedLine, getToc, proseClassName, rehypePlugins, remarkPlugins } from "@/lib/mdx";
import { cn } from "@/lib/utils";

interface EditorProps {
  lng: Language;
}

export function Editor({ lng: lngParam }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation(lngParam);
  const [markdown, setMarkdown] = useState<string>("");
  const prevValueRef = useRef<string>(null);
  const currValueRef = useRef<string>(null);
  const [_, setLineChange] = useState<number>(0);

  const syncMarkdownPreview = debounce(() => {
    if (!textareaRef.current) return;

    currValueRef.current = getSelectedLine(textareaRef.current);
    if (prevValueRef.current !== currValueRef.current) setLineChange((prev) => prev + 1);
  }, 100);

  const handleKeyUpMarkdown = syncMarkdownPreview;
  const handleClickMarkdown = handleKeyUpMarkdown;

  const handleBlurMarkdown = debounce((e: React.FocusEvent<HTMLTextAreaElement>) => {
    currValueRef.current = e.target.value;
    setMarkdown(currValueRef.current);
    if (prevValueRef.current !== currValueRef.current) setLineChange((prev) => prev + 1);
  }, 100);

  const toc = useMemo(() => getToc(markdown), [markdown]);

  return (
    <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
      <TOCProvider toc={toc} single={false}>
        <div className="xl:col-span-2">
          <Textarea
            ref={textareaRef}
            name="markdown"
            className="h-56 resize-none"
            placeholder={t("Please input markdown here...")}
            defaultValue={markdown}
            onKeyUp={handleKeyUpMarkdown}
            onClick={handleClickMarkdown}
            onBlur={handleBlurMarkdown}
          />
          {toc.length > 0 && (
            <nav
              id="nav-toc"
              className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_(12_+_8_+_56_+_24))] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-md:hidden"
            >
              <div className="mb-2 flex items-center gap-2">
                <AlignLeft className="size-4" />
                <p className="m-0 text-muted-foreground text-sm">목차</p>
              </div>

              <TOCScrollArea className="overflow-auto p-0">
                <TocClerk />
              </TOCScrollArea>
            </nav>
          )}
        </div>

        <Card className="h-[calc(100dvh_-_var(--spacing)_*_(12_+_32))] scroll-pt-8 overflow-y-auto md:col-span-2 xl:col-span-4">
          <CardContent className={proseClassName}>
            {currValueRef.current ? (
              <Markdown
                components={mdxComponents}
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
              >
                {currValueRef.current}
              </Markdown>
            ) : (
              <p className="text-muted-foreground">{t("Please input markdown...")}</p>
            )}
          </CardContent>
        </Card>
      </TOCProvider>
    </div>
  );
}
