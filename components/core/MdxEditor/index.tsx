"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import {
  AlignLeft,
  CircleAlert,
  MessageSquareHeart,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Viewport } from "@/components/core/Container";
import { KeyboardShortcuts } from "@/components/core/MdxEditor/KeyboardShortcuts";
import { LineEditor } from "@/components/core/MdxEditor/LineEditor";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle,
} from "@/components/ui/shadcn-io/banner";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { MdxLoader } from "@/lib/mdx/react";
import { clear as clearMarkdown, getHunks, getToc, trailingFootnotes } from "@/lib/mdx/utils";
import {
  Doctype,
  DocumentForm,
  Document as DocumentType,
  doctypeEnum,
  documentForm,
} from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";
import { Remocon } from "@/components/core/MdxEditor/Remocon";

interface MdxEditorProps {
  lng: Language;
  doc?: DocumentType;
  doctype?: Doctype;
  title?: string;
  deletable?: boolean;
}

export default function MdxEditor({
  lng: lngParam,
  doc,
  doctype: defaultDoctype,
  title: defaultTitle,
  deletable,
}: MdxEditorProps) {
  const router = useRouter();

  const lng = localePrefix(lngParam);
  const { t } = useTranslation(lngParam);

  const [hunk, setHunk] = useState<string>("");
  const [lines, setLines] = useState<string[]>(getHunks(doc?.content || ""));
  const [selectedLine, setSelectedLine] = useState<number>(-1);

  const lineRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentForm),
    defaultValues: {
      id: doc?.id,
      description: doc?.description,
      type: defaultDoctype || doctypeEnum.document,
      title: doc?.title || defaultTitle || "",
      content: doc?.content || "",
    },
  });

  const title = form.watch("title");
  const description = form.watch("description");
  const doctype = form.watch("type");
  const content = form.watch("content");

  const handleChangeHunk = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHunk(e.target.value);
  }, 110);

  const handleKeyDownHunk = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeHunk.cancel();
      e.preventDefault();

      setLines(lines.concat(getHunks(e.currentTarget.value.trim())));
      setHunk("");
      lineRef.current!.value = "";
    }
  };

  const handleChangeTitle = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
  }, 110);

  const handleChangeDescription = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("description", e.target.value);
  }, 110);

  const handleSubmit = form.handleSubmit(async (values: DocumentForm) => {
    const options = {
      method: values.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    };

    const res = await fetch("/api/document", options);

    if (!res.ok) return toast.error(statusMessage({ t, status: res.status, options }));

    const { id } = await res.json();

    toast.success(statusMessage({ t, status: res.status, options }), { description: values.title });
    router.push(`${lng}/${values.type}?${new URLSearchParams({ id })}`);
  });

  const handleDelete = async () => {
    if (!doc?.id) return;

    const options = { method: "DELETE" };
    const res = await fetch(
      `/api/document?${new URLSearchParams({ id: doc.id, type: doctype })}`,
      options,
    );

    if (!res.ok) return toast.error(statusMessage({ t, status: res.status, options }));

    toast.success(statusMessage({ t, status: res.status, options }));
    router.push(`${lng}/me/documents`);
  };

  const handleClear = () => {
    setLines([]);
    setHunk("");
    lineRef.current!.value = "";
  };

  useEffect(() => {
    form.setValue("content", clearMarkdown(trailingFootnotes(lines.join("\n\n"))));
  }, [lines]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const toc = useMemo(() => getToc(content), [content]);

  const canSave = useMemo(() => Boolean(lines.length) && Boolean(title.length), [lines, title]);

  return (
    <>
      <KeyboardShortcuts
        onSave={() =>
          canSave ? handleSubmit() : toast.warning(t("Content is empty or title is missing."))
        }
      />

      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <TOCProvider toc={toc} single={false}>
            <Viewport>
              <article
                className={cn(
                  "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
                  "h-fit",
                  "prose dark:prose-invert",
                  "pt-8 pr-2 pb-24 pl-4 max-lg:pr-4",
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
                  "[&_section.footnotes]:mt-24 [&_section.footnotes]:border-t",
                  "[&_section.footnotes>ol_li_p]:!my-1 [&_section.footnotes>ol_li]:text-sm",
                  "prose-a:[&[data-footnote-ref]]:before:content-['[']",
                  "prose-a:[&[data-footnote-ref]]:after:content-[']']",
                )}
              >
                <div className="mb-2 flex items-center gap-1">
                  <Toggle
                    variant="outline"
                    pressed={doctype === doctypeEnum.document}
                    className={cn({
                      "!border-blue-200 !bg-blue-50 !text-blue-800":
                        doctype === doctypeEnum.document,
                    })}
                    onPressedChange={(pressed) =>
                      pressed && form.setValue("type", doctypeEnum.document)
                    }
                    aria-label="Toggle wkdoc"
                    size="sm"
                  >
                    <ScrollText className="size-4" />
                    {t("document")}
                  </Toggle>
                  <Toggle
                    variant="outline"
                    pressed={doctype === doctypeEnum.essay}
                    className={cn({
                      "!border-rose-200 !bg-rose-50 !text-rose-800": doctype === doctypeEnum.essay,
                    })}
                    onPressedChange={(pressed) =>
                      pressed && form.setValue("type", doctypeEnum.essay)
                    }
                    aria-label="Toggle essay"
                    size="sm"
                  >
                    <MessageSquareHeart className="size-4" />
                    {t("essay")}
                  </Toggle>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="mb-4">
                      <FormControl>
                        <Input
                          {...field}
                          ref={titleRef}
                          className="rounded-none"
                          placeholder={t("Please input title")}
                          defaultValue={value}
                          onChange={handleChangeTitle}
                          readOnly={Boolean(doc?.id)}
                          required
                        />
                      </FormControl>
                      <FormDescription className="!m-0">
                        {t("Title cannot be change after document created.")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="mb-6">
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-none"
                          placeholder={t("Please input description")}
                          defaultValue={value}
                          onChange={handleChangeDescription}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {title && (
                  <h1 className={cn("my-8", { "!mb-1": Boolean(description) })}>{title}</h1>
                )}
                {description && (
                  <h2 className="!m-0 !mb-8 font-font-semibold text-lg text-muted-foreground">
                    {description}
                  </h2>
                )}

                <LineEditor
                  lng={lngParam}
                  lines={lines}
                  setLines={setLines}
                  selectedLine={selectedLine}
                  setSelectedLine={setSelectedLine}
                />

                {hunk && (
                  <div className="bg-accent px-1">
                    <MdxLoader source={hunk} />
                  </div>
                )}

                <Textarea
                  ref={lineRef}
                  name="hunk"
                  className="h-fit max-h-56 min-h-28 resize-none rounded-none font-mono"
                  placeholder={t("Writing a paragraph...")}
                  onFocus={() => setSelectedLine(-1)}
                  onChange={handleChangeHunk}
                  onKeyDown={handleKeyDownHunk}
                />
              </article>

              <nav
                id="nav-toc"
                className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col space-y-2 pt-56 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
              >
                <div className="mb-2 flex items-center gap-2">
                  <AlignLeft className="size-4" />
                  <p className="m-0 text-muted-foreground text-sm">
                    {title || t("Table of contents")}
                  </p>
                </div>

                <TOCScrollArea className="mb-2 overflow-auto p-0">
                  <TocClerk lng={lngParam} />
                </TOCScrollArea>

                <Remocon
                  t={t}
                  content={content}
                  copiable={Boolean(lines.length)}
                  deletable={deletable}
                  resetable={content !== (doc?.content || "")}
                  savable={canSave}
                  clearable={Boolean(lines.length)}
                  onSave={handleSubmit}
                  onDelete={handleDelete}
                  onClear={handleClear}
                  onUndoAll={() => {
                    setLines(getHunks(doc?.content || ""));
                    setTimeout(() => lineRef.current!.focus());
                  }}
                />
              </nav>
            </Viewport>
          </TOCProvider>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Textarea
                    value={content}
                    name={field.name}
                    readOnly
                    onChange={(e) => form.setValue("content", e.currentTarget.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Banner
            className="absolute top-0 right-0 left-0"
            style={
              {
                "--primary": "var(--color-orange-400)",
                "--primary-foreground": "var(--color-white)",
              } as React.CSSProperties
            }
          >
            <BannerIcon icon={CircleAlert} />
            <BannerTitle>작성요령을 꼭 읽어주세요. 🥳</BannerTitle>
            <BannerAction size="sm" asChild>
              <Link href={`${lng}/editor/tip`}>작성요령</Link>
            </BannerAction>
            <BannerClose type="button" />
          </Banner>
        </form>
      </Form>
    </>
  );
}
