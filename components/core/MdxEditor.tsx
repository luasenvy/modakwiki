"use client";

import "highlight.js/styles/vs2015.min.css";
import "@/styles/highlight-code-lines.css";
import "@/styles/highlight-code-titles.css";

import "katex/dist/katex.min.css";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash.debounce";
import {
  AlignLeft,
  Check,
  CircleAlert,
  Copy,
  GripVertical,
  MessageSquareHeart,
  Pencil,
  PencilOff,
  Save,
  ScrollText,
  Shredder,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Container } from "@/components/core/Container";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { MdxLoader } from "@/lib/mdx/react";
import { clear as clearMarkdown, getHunks, getToc, trailingFootnotes } from "@/lib/mdx/utils";
import { DocumentForm, doctypeEnum, documentForm } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface MdxEditorProps {
  lng: Language;
}

export default function MdxEditor({ lng: lngParam }: MdxEditorProps) {
  const lng = localePrefix(lngParam);
  const { t } = useTranslation(lngParam);

  const [hunk, setHunk] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [lines, setLines] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<number>(-1);
  const lineRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const prevSelectedLineContent = useRef<string>("");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentForm),
    defaultValues: {
      type: doctypeEnum.wkdoc,
      title: "",
      content: "",
    },
  });

  const title = form.watch("title");
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

  const handleChangeSelectedLine = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLines((prev) => prev.toSpliced(selectedLine, 1, e.target.value.trim()));
  }, 110);

  const handleKeyDownSelectedLine = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeSelectedLine.cancel();
      e.preventDefault();

      setLines(lines.toSpliced(selectedLine, 1, e.currentTarget.value.trim()));
      setSelectedLine(-1);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (!over) return;

    if (active.id !== over.id) {
      // parse indices from ids like `line-0`, `line-1`
      const parseIndex = (id: unknown) => {
        const n = Number(String(id).split("-").pop());
        return Number.isFinite(n) ? n : -1;
      };

      const oldIndex = parseIndex(active.id);
      const newIndex = parseIndex(over.id);

      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex)
        setLines((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const handleChangeTitle = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("title", e.target.value);
  }, 110);

  const handleSubmit = form.handleSubmit(async (values: DocumentForm) => {
    const res = await fetch("/api/document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) return toast.error(await res.text());

    console.info(201);
  });

  const handleClickCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
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
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <TOCProvider toc={toc} single={false}>
          <Container>
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
                "[&>section.footnotes]:mt-24 [&>section.footnotes]:border-t",
                "prose-a:[&[data-footnote-ref]]:before:content-['[']",
                "prose-a:[&[data-footnote-ref]]:after:content-[']']",
              )}
            >
              <div className="mb-2 flex items-center gap-1">
                <Toggle
                  pressed={doctype === doctypeEnum.wkdoc}
                  onPressedChange={(pressed) => pressed && form.setValue("type", doctypeEnum.wkdoc)}
                  aria-label="Toggle wkdoc"
                  size="sm"
                >
                  <ScrollText className="size-4" />
                  {t("document")}
                </Toggle>
                <Toggle
                  pressed={doctype === doctypeEnum.essay}
                  onPressedChange={(pressed) => pressed && form.setValue("type", doctypeEnum.essay)}
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
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        ref={titleRef}
                        className="rounded-none"
                        placeholder={t("Please input title")}
                        defaultValue={value}
                        onChange={handleChangeTitle}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={lines.map((_, i) => `line-${i}`)}
                  strategy={verticalListSortingStrategy}
                  disabled={selectedLine > -1}
                >
                  {lines.map((line, i) => (
                    <SortableItem
                      lng={lngParam}
                      className={cn("group/line hover:bg-accent", {
                        group: selectedLine < 0,
                        "my-8 border border-primary bg-accent p-2": selectedLine === i,
                      })}
                      id={`line-${i}`}
                      key={`line-${i}`}
                    >
                      <MdxLoader>{line}</MdxLoader>
                      {selectedLine === i && (
                        <Textarea
                          name="prev"
                          className="mt-2 h-fit max-h-56 min-h-28 resize-none rounded-none font-mono"
                          placeholder={t("Please input text here")}
                          defaultValue={lines[selectedLine]}
                          onChange={handleChangeSelectedLine}
                          onKeyDown={handleKeyDownSelectedLine}
                        />
                      )}

                      <div className="absolute top-0 right-0 hidden bg-background shadow-sm group-hover/line:flex">
                        {selectedLine === i ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            title={t("Cancel Edit")}
                            className="!bg-transparent !text-orange-500 hover:!text-orange-600"
                            onClick={() => {
                              // return prev
                              setLines(
                                Array.from(
                                  lines.toSpliced(selectedLine, 1, prevSelectedLineContent.current),
                                ),
                              );
                              setSelectedLine(-1);
                            }}
                          >
                            <PencilOff className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            title={t("Edit")}
                            className="!bg-transparent !text-orange-500 hover:!text-orange-600"
                            onClick={() => {
                              if (selectedLine !== i) {
                                prevSelectedLineContent.current = lines[i];
                                return setSelectedLine(i);
                              }
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="!bg-transparent hover:!text-red-600 text-red-500"
                          type="button"
                          title={t("Remove Paragraph")}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLines((prev) => prev.filter((_, index) => index !== i));
                          }}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableContext>
              </DndContext>

              <div className="bg-accent">
                <MdxLoader>{hunk}</MdxLoader>
              </div>

              <Textarea
                ref={lineRef}
                name="hunk"
                className="mt-2 h-fit max-h-56 min-h-28 resize-none rounded-none font-mono"
                placeholder={
                  !title.length ? t("Please input title first") : t("Writing a paragraph...")
                }
                disabled={!title.length}
                onFocus={() => setSelectedLine(-1)}
                onChange={handleChangeHunk}
                onKeyDown={handleKeyDownHunk}
              />
            </article>

            <nav
              id="nav-toc"
              className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col space-y-2 pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
            >
              <div className="mb-2 flex items-center gap-2">
                <AlignLeft className="size-4" />
                <p className="m-0 text-muted-foreground text-sm">목차</p>
              </div>

              <TOCScrollArea className="overflow-auto p-0">
                <TocClerk lng={lngParam} />
              </TOCScrollArea>
            </nav>
          </Container>
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

        <div
          className={cn(
            "bg-background opacity-60 transition-opacity duration-200 ease-in-out hover:opacity-100",
            "-translate-x-1/2 fixed inset-x-1/2 bottom-2 flex w-fit items-center justify-center gap-1 rounded-lg border px-4 py-1 shadow",
          )}
        >
          <Button
            type="submit"
            variant="ghost"
            className="!text-muted-foreground hover:!text-foreground size-6"
            size="icon"
            title={t("Save Document")}
            disabled={!canSave}
          >
            <Save className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!text-muted-foreground hover:!text-foreground size-6"
            size="icon"
            title={t("Copy to clipboard")}
            onClick={handleClickCopy}
            disabled={!lines.length}
          >
            {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="!text-muted-foreground hover:!text-destructive size-6"
                size="icon"
                title={t("Save Document")}
                disabled={!canSave}
              >
                <Shredder className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("This action cannot be undone. This will erase this document changes.")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setLines([]);
                    setTimeout(() => lineRef.current!.focus());
                  }}
                >
                  {t("Yes, I'm sure")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}

interface SortableProps extends React.ComponentProps<"div"> {
  lng: Language;
  id: string;
}

function SortableItem({ lng: lngParam, children, className, ...props }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({
    id: props.id,
  });

  const { t } = useTranslation(lngParam);

  return (
    <div
      ref={setNodeRef}
      className={cn(className, "relative flex items-center")}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        transition: isSorting ? transition : undefined,
      }}
      {...props}
    >
      <div
        className="hidden size-8 shrink-0 cursor-grab px-2 group-hover:flex"
        title={t("Drag to change order")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="m-auto size-5" />
      </div>

      <div className="w-[calc(100%_-_(var(--spacing)_*_8))] grow">{children}</div>
    </div>
  );
}
