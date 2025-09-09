"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { CircleAlert, MessageSquareHeart, ScrollText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Container, Viewport } from "@/components/core/Container";
import { MultiSelect, MultiSelectOption } from "@/components/core/input/MultiSelect";
import { KeyboardShortcuts } from "@/components/core/MdxEditor/KeyboardShortcuts";
import { LineEditor } from "@/components/core/MdxEditor/LineEditor";
import { Remocon } from "@/components/core/MdxEditor/Remocon";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { NavToc } from "@/components/core/MdxViewer/NavToc";
import { TOCProvider } from "@/components/fumadocs/toc";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tag } from "@/lib/schema/tag";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<MultiSelectOption[]>([]);
  const [selectedLine, setSelectedLine] = useState<number>(-1);

  const lineRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentForm),
    defaultValues: {
      id: doc?.id,
      description: doc?.description,
      category: doc?.category || "",
      tags: doc?.tags || [],
      type: defaultDoctype || doctypeEnum.document,
      title: doc?.title || defaultTitle || "",
      content: doc?.content || "",
    },
  });

  const title = form.watch("title");
  const category = form.watch("category");
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

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData.files;
    if (files.length) {
      e.preventDefault();

      const formData = new FormData();

      for (const file of files) formData.append("files", file);

      const options = { method: "POST", body: formData };

      const res = await fetch("/api/image", options);

      if (!res.ok) return statusMessage({ t, status: res.status, options });

      const uris = await res.json();

      (e.target as HTMLTextAreaElement).value += uris
        .map((uri: string) => `![Uploaded Image](/api/image${uri})`)
        .join("\n\n");

      // handleChangeHunk();
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

  const getTags = useCallback(async () => {
    if (!category) return setTags([]);

    const res = await fetch(`/api/tag?${new URLSearchParams({ category })}`);

    if (!res.ok) return toast.error(statusMessage({ t, status: res.status }));

    const rows: Tag[] = await res.json();
    setTags(rows.map(({ id }) => ({ label: id, value: id })));
  }, [category]);

  useEffect(() => {
    if (doc?.tags?.length && tags.some((t) => doc!.tags!.includes(t.value)))
      return form.setValue("tags", doc!.tags!);

    form.setValue("tags", []);
  }, [tags]);

  useEffect(() => {
    getTags();
  }, [getTags]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    setCategories([]);
    form.setValue("tags", []);

    if (doctype === doctypeEnum.essay) {
      (async () => {
        const res = await fetch("/api/category");

        if (!res.ok) return toast.error(statusMessage({ t, status: res.status }));

        setCategories(await res.json());
      })();
    }
  }, [doctype]);

  useEffect(() => {
    form.setValue("category", doc?.category || categories[0] || "");
  }, [categories]);

  const toc = useMemo(() => getToc(content), [content]);

  const canSave = useMemo(() => Boolean(lines.length) && Boolean(title.length), [lines, title]);

  return (
    <>
      <KeyboardShortcuts
        onSave={() =>
          canSave ? handleSubmit() : toast.warning(t("Content is empty or title is missing."))
        }
      />
      <FootnoteHighlighter />

      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <TOCProvider toc={toc} single={false}>
            <Viewport>
              <Container as="article" variant="document">
                <div className="mb-2 flex items-center gap-1">
                  {(!Boolean(doc?.id) || doctypeEnum.document === doctype) && (
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
                  )}
                  {(!Boolean(doc?.id) || doctypeEnum.essay === doctype) && (
                    <Toggle
                      variant="outline"
                      pressed={doctype === doctypeEnum.essay}
                      className={cn({
                        "!border-rose-200 !bg-rose-50 !text-rose-800":
                          doctype === doctypeEnum.essay,
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
                  )}
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

                <div
                  className={cn("flex items-center gap-1", {
                    hidden: doctype !== doctypeEnum.essay,
                  })}
                >
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem className="mb-6 shrink-0">
                        <FormControl>
                          <Select value={value} onValueChange={onChange} {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select a category")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((id) => (
                                <SelectItem key={id} value={id}>
                                  {id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {category && (
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem className="mb-6 grow">
                          <FormControl>
                            <MultiSelect
                              responsive
                              i18n={{
                                selectAll: t("Select All"),
                                clear: t("Clear"),
                                close: t("Close"),
                                placeholder: t("Search options..."),
                              }}
                              popoverClassName="!w-fit"
                              onValueChange={onChange}
                              defaultValue={value}
                              options={tags}
                              placeholder={t("Select tags")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

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
                  onPaste={handlePaste}
                />
              </Container>

              <NavToc lng={lngParam} title={title}>
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
              </NavToc>
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
