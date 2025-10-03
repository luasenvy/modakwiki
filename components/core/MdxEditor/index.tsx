"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import { CheckIcon, CircleAlert, MessageSquareHeart, ScrollText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Container, Viewport } from "@/components/core/Container";
import { ImageSelectButton } from "@/components/core/MdxEditor/ImageSelectButton";
import { ImageUploadAPI, ImageUploadButton } from "@/components/core/MdxEditor/ImageUploadButton";
import { InternalLinkButton } from "@/components/core/MdxEditor/InternalLinkButton";
import { KeyboardShortcuts } from "@/components/core/MdxEditor/KeyboardShortcuts";
import { LineEditor } from "@/components/core/MdxEditor/LineEditor";
import { Remocon } from "@/components/core/MdxEditor/Remocon";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { NavToc } from "@/components/core/MdxViewer/NavToc";
import { TOCProvider } from "@/components/fumadocs/toc";
import {
  PageTOCPopover,
  PageTOCPopoverContent,
  PageTOCPopoverItems,
  PageTOCPopoverTrigger,
} from "@/components/fumadocs/toc-popover";
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
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/shadcn-io/tags";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { licenseEnum } from "@/lib/license";
import { MdxLoader } from "@/lib/mdx/react";
import { clear as clearMarkdown, getHunks, getToc, trailingFootnotes } from "@/lib/mdx/utils";
import {
  Doctype,
  DocumentForm,
  Document as DocumentType,
  doctypeEnum,
  documentForm,
} from "@/lib/schema/document";
import { Image, Image as ImageType } from "@/lib/schema/image";
import { Tag } from "@/lib/schema/tag";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface MdxEditorProps {
  lng: Language;
  doc?: DocumentType;
  doctype?: Doctype;
  title?: string;
  deletable?: boolean;
  category?: string;
  tags?: string[];
}

export default function MdxEditor({
  lng: lngParam,
  doc,
  doctype: defaultDoctype,
  title: defaultTitle,
  deletable,
  category: defaultCategory,
  tags: defaultTags,
}: MdxEditorProps) {
  const router = useRouter();

  const lng = localePrefix(lngParam);
  const { t } = useTranslation(lngParam);

  const [hunk, setHunk] = useState<string>("");
  const [lines, setLines] = useState<string[]>(getHunks(doc?.content || ""));
  const [saving, setSaving] = useState<boolean>(false);
  const uploadingState = useState<boolean>(false);
  const [uploading] = uploadingState;
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedLine, setSelectedLine] = useState<number>(-1);

  const containerRef = useRef<HTMLElement>(null);
  const imageUploadRef = useRef<ImageUploadAPI>(null);
  const lineRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentForm),
    defaultValues: {
      id: doc?.id,
      description: doc?.description,
      category: doc?.category || defaultCategory || "",
      license: doc?.license || licenseEnum.ccbysa,
      tags: doc?.tags || defaultTags || [],
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
  const selectedTags = form.watch("tags") || [];

  const toc = useMemo(() => getToc(content), [content]);
  const canSave = useMemo(() => Boolean(lines.length) && Boolean(title.length), [lines, title]);

  const handleChangeHunk = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHunk(e.target.value);
  }, 110);

  const handleKeyDownHunk = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeHunk.cancel();
      e.preventDefault();

      setLines(Array.from(lines).concat(getHunks(e.currentTarget.value.trim())));
      setHunk("");
      lineRef.current!.value = "";
    }
  };

  const handleSelectInternalLink = async (doc: DocumentType & { type: Doctype }) => {
    if (!lineRef.current) return;

    const { selectionStart, selectionEnd } = lineRef.current;

    const curr = `${hunk.substring(0, selectionStart)} [${hunk.substring(selectionStart, selectionEnd) || doc.title}](/${doc.type}?${new URLSearchParams({ id: doc.id })})${hunk.substring(selectionEnd)}`;

    setHunk(curr);
    lineRef.current.value = curr;
  };

  const handleSelectImage = async (image: ImageType) => {
    if (!lineRef.current) return;

    const { selectionStart, selectionEnd } = lineRef.current;

    const curr =
      `${hunk.substring(0, selectionStart)}\n\n![${image.name} width-${image.width} height-${image.height}](/api/image${image.uri}-o)\n\n${hunk.substring(selectionEnd)}`
        .replace(/\n{3,}/, "\n\n")
        .trim();

    setHunk(curr);
    lineRef.current.value = curr;
  };

  const handleImageSave = async (res: Response) => {
    handleChangeHunk.cancel();

    if (!res.ok) return toast.error(await res.text());

    const saves: Image[] = await res.json();

    const curr =
      `${hunk}\n\n${saves.map(({ uri, name, width, height }) => `![${name} width-${width} height-${height}](/api/image${uri}-o)`).join("\n\n")}`
        .replace(/\n{3,}/, "\n\n")
        .trim();
    setHunk(curr);

    lineRef.current!.value = curr;
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData.files;
    if (!files.length) return;

    e.preventDefault();

    const res = await imageUploadRef.current!.upload(files);

    if (!res.ok) return toast.error(await res.text());

    const saves: Image[] = await res.json();

    const curr =
      `${hunk}\n\n${saves.map(({ uri, name, width, height }) => `![${name} width-${width} height-${height}](/api/image${uri}-o)`).join("\n\n")}`
        .replace(/\n{3,}/, "\n\n")
        .trim();
    setHunk(curr);

    lineRef.current!.value = curr;
  };

  const handleChangeTitle = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
  }, 110);

  const handleChangeDescription = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("description", e.target.value);
  }, 110);

  const handleSubmit = form.handleSubmit(async (values?: DocumentForm) => {
    if (!values) values = form.getValues();

    if (!Boolean(values.title.length) || !Boolean(values.content.length))
      return toast.warning(t("Content is empty or title is missing."));

    const options = {
      method: values.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    };

    try {
      setSaving(true);

      const res = await fetch("/api/document", options);

      if (!res.ok) return toast.error(await statusMessage({ t, res, options }));

      toast.success(await statusMessage({ t, res, options }), { description: values.title });

      if ("POST" === options.method) {
        const { id } = await res.json();
        setTimeout(
          () =>
            router.push(`${lng}/editor/write?${new URLSearchParams({ id, type: values.type })}`),
          1000,
        );
      }
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!doc?.id) return;

    const options = { method: "DELETE" };
    const res = await fetch(
      `/api/document?${new URLSearchParams({ id: doc.id, type: doctype })}`,
      options,
    );

    if (!res.ok) return toast.error(await statusMessage({ t, res, options }));

    toast.success(await statusMessage({ t, res, options }));
    router.push(`${lng}/me/documents`);
  };

  const handleClear = () => {
    setLines([]);
    setHunk("");
    lineRef.current!.value = "";
  };

  const handleRemoveTag = (value: string) => {
    if (!selectedTags.includes(value)) return;

    form.setValue(
      "tags",
      selectedTags.filter((v) => v !== value),
    );
  };

  const handleSelectTag = (value: string) => {
    if (selectedTags.includes(value)) return handleRemoveTag(value);

    form.setValue("tags", [...selectedTags, value]);
  };

  useEffect(() => {
    form.setValue("content", clearMarkdown(trailingFootnotes(lines.join("\n\n"))));
  }, [lines]);

  const getTags = useCallback(async () => {
    if (!category) return setTags([]);

    const res = await fetch(`/api/tag?${new URLSearchParams({ category, type: doctype })}`);

    if (!res.ok) return toast.error(await statusMessage({ t, res }));

    setTags(await res.json());
  }, [category]);

  useEffect(() => {
    if (doc?.tags?.length && tags.some((t) => doc!.tags!.includes(t.id)))
      return form.setValue("tags", doc!.tags!);

    if (defaultTags && tags.some((t) => defaultTags.includes(t.id)))
      return form.setValue("tags", defaultTags);

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

    (async () => {
      const res = await fetch(`/api/category?${new URLSearchParams({ type: doctype })}`);

      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setCategories(await res.json());
    })();
  }, [doctype]);

  useEffect(() => {
    form.setValue("category", doc?.category || defaultCategory || categories[0] || "");
  }, [categories]);

  const handlePopState = (event: PopStateEvent) => {
    // 사용자가 '예'를 선택한 경우, 한 번 더 뒤로가기
    if (window.confirm(t("There is unsaved changes. Are you sure to leave this page?")))
      window.history.back();
    // 사용자가 '아니요'를 선택한 경우, 다시 현재 페이지 상태로 되돌림
    else window.history.pushState(null, "", window.location.pathname);
  };

  useEffect(() => {
    // 뒤로가기 버튼을 눌렀을 때 동작을 가로채기 위해, 현재 페이지에 히스토리 상태를 추가
    // 이렇게 하면 '뒤로가기'를 누르면 이 상태가 먼저 pop되어 감지할 수 있음
    window.history.pushState(null, "", window.location.pathname);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // 의존성 배열에 상태를 추가

  return (
    <>
      <KeyboardShortcuts onSave={handleSubmit} />
      <FootnoteHighlighter />

      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <TOCProvider toc={toc} single={false}>
            <Viewport>
              <PageTOCPopover title={title}>
                <PageTOCPopoverTrigger lng={lngParam} />
                <PageTOCPopoverContent>
                  <PageTOCPopoverItems lng={lngParam} />
                </PageTOCPopoverContent>
              </PageTOCPopover>

              <Container ref={containerRef} as="article" variant="document">
                <div className="mb-2 flex items-center gap-1">
                  {(!Boolean(doc?.id) || doctypeEnum.document === doctype) && (
                    <Toggle
                      variant="outline"
                      pressed={doctype === doctypeEnum.document}
                      className={cn("rounded-none", {
                        "!border-blue-200 !bg-blue-50 !text-blue-800":
                          doctype === doctypeEnum.document,
                      })}
                      onPressedChange={(pressed: boolean) =>
                        pressed && form.setValue("type", doctypeEnum.document)
                      }
                      aria-label="Toggle wkdoc"
                      size="sm"
                    >
                      <ScrollText className="size-4" />
                      {t("document")}
                    </Toggle>
                  )}
                  {(!Boolean(doc?.id) || doctypeEnum.post === doctype) && (
                    <Toggle
                      variant="outline"
                      pressed={doctype === doctypeEnum.post}
                      className={cn("rounded-none", {
                        "!border-rose-200 !bg-rose-50 !text-rose-800": doctype === doctypeEnum.post,
                      })}
                      onPressedChange={(pressed: boolean) =>
                        pressed && form.setValue("type", doctypeEnum.post)
                      }
                      aria-label="Toggle post"
                      size="sm"
                    >
                      <MessageSquareHeart className="size-4" />
                      {t("post")}
                    </Toggle>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="mb-2 gap-1">
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
                      <FormDescription className="!m-0 text-orange-500 text-xs">
                        {t("Title cannot be change after document created.")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-1">
                  <FormField
                    control={form.control}
                    name="license"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem className="mb-1 shrink-0">
                        <FormControl>
                          <Select value={value} onValueChange={onChange} {...field}>
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder={t("Select a license")} />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(licenseEnum).map((value) => (
                                <SelectItem key={`license-${value}`} value={value}>
                                  {t(value)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem className="mb-1 shrink-0">
                        <FormControl>
                          <Select value={value} onValueChange={onChange} {...field}>
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder={t("Select a category")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((id) => (
                                <SelectItem key={`category-${id}`} value={id}>
                                  {t(id)}
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
                      render={({ field: { value } }) => (
                        <FormItem className="mb-1 grow">
                          <FormControl>
                            <Tags>
                              <TagsTrigger
                                className="rounded-none"
                                i18n={{ selectATag: t("Select a tag") }}
                              >
                                {value?.map((tag) => (
                                  <TagsValue
                                    key={`tag-value-${tag}`}
                                    onRemove={() => handleRemoveTag(tag)}
                                  >
                                    {t(tag)}
                                  </TagsValue>
                                ))}
                              </TagsTrigger>
                              <TagsContent>
                                <TagsInput placeholder={t("Search options...")} />
                                <TagsList>
                                  <TagsEmpty>{t("No tags found.")}</TagsEmpty>
                                  <TagsGroup>
                                    {tags
                                      .filter((tag) => !value?.includes(tag.id))
                                      .map(({ id }) => (
                                        <TagsItem
                                          key={`tag-${id}`}
                                          onSelect={handleSelectTag}
                                          value={id}
                                        >
                                          {t(id)}
                                          {selectedTags.includes(id) && (
                                            <CheckIcon
                                              className="text-muted-foreground"
                                              size={14}
                                            />
                                          )}
                                        </TagsItem>
                                      ))}
                                  </TagsGroup>
                                </TagsList>
                              </TagsContent>
                            </Tags>
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
                    <FormItem className="mb-4">
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
                  <h1 className={cn("!my-12", { "!mb-1": Boolean(description) })}>{title}</h1>
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
                <div className="relative">
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
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <ImageUploadButton
                      ref={imageUploadRef}
                      lng={lngParam}
                      uploadingState={uploadingState}
                      onSave={handleImageSave}
                    />

                    <ImageSelectButton lng={lngParam} onSelect={handleSelectImage} />
                    <InternalLinkButton lng={lngParam} onSelect={handleSelectInternalLink} />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex bg-muted/80">
                      <div className="m-auto space-y-1 text-center">
                        <Spinner className="mx-auto" variant="ring" size={32} />
                        <p className="text-sm">{t("Uploading...")}</p>
                      </div>
                    </div>
                  )}
                </div>

                {saving && (
                  <div className="absolute inset-0 bg-accent/80">
                    <div className="fixed inset-0 flex flex-col">
                      <div className="m-auto">
                        <Spinner variant="bars" size={64} />
                        <p className="font-bold text-lg">{t("Saving...")}</p>
                      </div>
                    </div>
                  </div>
                )}
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
            className="absolute top-0 right-0 left-0 h-10"
            style={
              {
                "--primary": "var(--color-orange-400)",
                "--primary-foreground": "var(--color-white)",
              } as React.CSSProperties
            }
          >
            <BannerIcon icon={CircleAlert} />
            <BannerTitle>{t("Please read the writing instructions carefully. 🥳")}</BannerTitle>
            <BannerAction size="sm" asChild>
              <Link href={`${lng}/editor/tip`}>{t("Writing Instructions")}</Link>
            </BannerAction>
            <BannerClose type="button" />
          </Banner>
        </form>
      </Form>
    </>
  );
}
