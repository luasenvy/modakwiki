"use client";

import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { AlignLeft } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import mdxComponents from "@/components/mdx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { getSelectedLine, getToc, proseClassName, rehypePlugins, remarkPlugins } from "@/lib/mdx";
import { DocumentForm, documentForm } from "@/lib/schema/document";

interface EditorProps {
  lng: Language;
}

export function Editor({ lng: lngParam }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, 100);

  const handleKeyUpMarkdown = syncMarkdownPreview;
  const handleClickMarkdown = handleKeyUpMarkdown;

  const handleBlurMarkdown = debounce((e: React.FocusEvent<HTMLTextAreaElement>) => {
    currValueRef.current = e.target.value;
    if (prevValueRef.current !== currValueRef.current) setLineChange((prev) => prev + 1);
  }, 100);

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

  const toc = useMemo(() => getToc(form.getValues("content") || ""), [lineChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <TOCProvider toc={toc} single={false}>
            <div className="space-y-2 xl:col-span-2">
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
                        className="h-36 resize-none"
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
                className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_(12_+_8_+_36_+_24_+_13))] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-md:hidden"
              >
                <div className="mb-2 flex items-center gap-2">
                  <AlignLeft className="size-4" />
                  <p className="m-0 text-muted-foreground text-sm">목차</p>
                </div>

                <TOCScrollArea className="overflow-auto p-0">
                  <TocClerk />
                </TOCScrollArea>
              </nav>
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
                ) : currValueRef.current === null ? (
                  <p className="text-muted-foreground">{t("Please input text")}</p>
                ) : (
                  <p className="text-muted-foreground">{t("Empty Line")}</p>
                )}
              </CardContent>
              <CardFooter className="mt-auto justify-end">
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  disabled={!form.formState.isValid}
                >
                  {t("Save")}
                </Button>
              </CardFooter>
            </Card>
          </TOCProvider>
        </div>
      </form>
    </Form>
  );
}
