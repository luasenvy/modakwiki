"use client";

import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import "katex/dist/katex.min.css";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { AlignLeft } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Container } from "@/components/core/Container";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import mdxComponents from "@/components/mdx";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { getSelectedLine, getToc, rehypePlugins, remarkPlugins } from "@/lib/mdx/utils";
import { DocumentForm, documentForm } from "@/lib/schema/document";
import { cn } from "@/lib/utils";

interface EditorProps {
  lng: Language;
}

export function Editor({ lng: lngParam }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation(lngParam);
  const prevValueRef = useRef<string>(null);
  const currValueRef = useRef<string>(null);
  const [lineChange, setLineChange] = useState<number>(0);

  const syncMarkdownPreview = debounce(() => {
    if (!textareaRef.current) return;

    currValueRef.current = getSelectedLine(textareaRef.current);
    if (prevValueRef.current !== currValueRef.current) {
      prevValueRef.current = currValueRef.current;
      setLineChange((prev) => prev + 1);
    }
  }, 130);

  const handleKeyUpMarkdown = syncMarkdownPreview;
  const handleClickMarkdown = handleKeyUpMarkdown;

  const handleBlurMarkdown = debounce((e: React.FocusEvent<HTMLTextAreaElement>) => {
    currValueRef.current = e.target.value || null;
    if (prevValueRef.current !== currValueRef.current) setLineChange((prev) => prev + 1);
  }, 130);

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentForm),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleSubmit = async (values: DocumentForm) => {
    const res = await fetch("/api/doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) return toast.error(await res.text());

    console.info(201);
  };

  const toc = useMemo(() => getToc(currValueRef.current || ""), [lineChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TOCProvider toc={toc} single={false}>
          <Container>
            <article
              ref={previewRef}
              className={cn(
                "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
                "h-fit pt-8 pb-24",
                "prose dark:prose-invert",
                "pr-2 pl-4",
                "break-keep",
                // Sub
                "[&_sub]:text-muted-foreground",
                // Link
                "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
                // Code
                "prose-pre:max-h-[calc(var(--spacing)_*_100)]",
                // Image
                "prose-img:w-full",
                "prose-img:[&[alt*=width-4]]:max-w-4",
                "prose-img:[&[alt*=width-8]]:max-w-8",
                "prose-img:[&[alt*=width-12]]:max-w-12",
                "prose-img:[&[alt*=width-16]]:max-w-16",
                "prose-img:[&[alt*=width-20]]:max-w-20",
                "prose-img:[&[alt*=width-24]]:max-w-24",
                "prose-img:[&[alt*=width-28]]:max-w-28",
                "prose-img:[&[alt*=width-32]]:max-w-32",
                "prose-img:[&[alt*=width-36]]:max-w-36",
                "prose-img:[&[alt*=width-40]]:!max-w-40", // Avoid Duplicate with w-4
                "prose-img:[&[alt*=width-3xs]]:max-w-3xs",
                "prose-img:[&[alt*=width-2xs]]:max-w-2xs",
                "prose-img:[&[alt*=width-xs]]:max-w-xs",
                "prose-img:[&[alt*=width-sm]]:max-w-sm",
                "prose-img:[&[alt*=width-md]]:max-w-md",
                "prose-img:[&[alt*=width-lg]]:max-w-lg",
                "prose-img:[&[alt*=width-xl]]:max-w-xl",
                "prose-img:[&[alt*=width-2xl]]:max-w-2xl",
                "prose-img:[&[alt*=width-3xl]]:max-w-3xl",
                "prose-img:[&[alt*=width-4xl]]:max-w-4xl",
                "prose-img:[&[alt*=width-5xl]]:max-w-5xl",
                "prose-img:[&[alt*=width-6xl]]:max-w-6xl",
                "prose-img:[&[alt*=width-7xl]]:max-w-7xl",
                "prose-img:[&[alt*=height-4]]:max-h-4",
                "prose-img:[&[alt*=height-8]]:max-h-8",
                "prose-img:[&[alt*=height-12]]:max-h-12",
                "prose-img:[&[alt*=height-16]]:max-h-16",
                "prose-img:[&[alt*=height-20]]:max-h-20",
                "prose-img:[&[alt*=height-24]]:max-h-24",
                "prose-img:[&[alt*=height-28]]:max-h-28",
                "prose-img:[&[alt*=height-32]]:max-h-32",
                "prose-img:[&[alt*=height-36]]:max-h-36",
                "prose-img:[&[alt*=height-40]]:!max-h-40", // Avoid Duplicate with h-4
                "prose-img:[&[alt*=height-3xs]]:max-h-3xs",
                "prose-img:[&[alt*=height-2xs]]:max-h-2xs",
                "prose-img:[&[alt*=height-xs]]:max-h-xs",
                "prose-img:[&[alt*=height-sm]]:max-h-sm",
                "prose-img:[&[alt*=height-md]]:max-h-md",
                "prose-img:[&[alt*=height-lg]]:max-h-lg",
                "prose-img:[&[alt*=height-xl]]:max-h-xl",
                "prose-img:[&[alt*=height-2xl]]:max-h-2xl",
                "prose-img:[&[alt*=height-3xl]]:max-h-3xl",
                "prose-img:[&[alt*=height-4xl]]:max-h-4xl",
                "prose-img:[&[alt*=height-5xl]]:max-h-5xl",
                "prose-img:[&[alt*=height-6xl]]:max-h-6xl",
                "prose-img:[&[alt*=height-7xl]]:max-h-7xl",
                // Task
                "prose-ol:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
                "prose-ul:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
                // Table
                "prose-table:m-0",
                "prose-td:[&>img]:m-auto",
                // footnote
                "[&>section.footnotes]:mt-24 [&>section.footnotes]:border-t",
                "prose-a:[&[data-footnote-ref]]:before:content-['[']",
                "prose-a:[&[data-footnote-ref]]:after:content-[']']",
              )}
            >
              {currValueRef.current ? (
                <Markdown
                  components={mdxComponents}
                  remarkPlugins={remarkPlugins}
                  rehypePlugins={rehypePlugins}
                >
                  {currValueRef.current}
                </Markdown>
              ) : currValueRef.current === null ? (
                <p className="text-muted-foreground">{t("Please input text")}</p>
              ) : (
                <p className="text-muted-foreground">{t("Empty Line")}</p>
              )}
            </article>

            <div className="flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] flex-col space-y-2 pt-8 pr-4 pl-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field: { onBlur, onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t("Please input title")}
                        defaultValue={value}
                        onBlur={onChange}
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field: { ref, onBlur, onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        ref={(el) => {
                          textareaRef.current = el;
                          ref(el);
                        }}
                        className="h-64 resize-none"
                        placeholder={t("Please input text here")}
                        defaultValue={value}
                        onKeyUp={handleKeyUpMarkdown}
                        onClick={handleClickMarkdown}
                        onBlur={(e) => {
                          handleBlurMarkdown(e);
                          onChange(e);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <nav
                id="nav-toc"
                className="flex h-[calc(100dvh_-(_var(--spacing)_*_(12_+_64_+_9_+_4_+_8)))] shrink-0 flex-col pt-8 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <AlignLeft className="size-4" />
                  <p className="m-0 text-muted-foreground text-sm">목차</p>
                </div>

                <TOCScrollArea className="overflow-auto p-0">
                  <TocClerk lng={lngParam} />
                </TOCScrollArea>
              </nav>
            </div>
          </Container>
        </TOCProvider>
      </form>
    </Form>
  );
}
