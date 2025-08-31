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
import { AlignLeft, GripVertical } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Container } from "@/components/core/Container";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { MdxLoader } from "@/lib/mdx/react";
import { getHunks, getToc } from "@/lib/mdx/utils";
import { DocumentForm, documentForm } from "@/lib/schema/document";
import { cn } from "@/lib/utils";

interface MdxEditorProps {
  lng: Language;
}

export default function MdxEditor({ lng: lngParam }: MdxEditorProps) {
  const { t } = useTranslation(lngParam);

  const [hunk, setHunk] = useState<string>("");
  const [lines, setLines] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<number>(-1);
  const lineRef = useRef<HTMLTextAreaElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

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

  const handleChangeHunk = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHunk(e.target.value);
  }, 120);

  const handleKeyDownHunk = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeHunk.cancel();
      e.preventDefault();

      setLines(getHunks(e.currentTarget.value.trim()));
      setHunk("");
      lineRef.current!.value = "";
    }
  };

  const handleChangeSelectedLine = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLines((prev) => prev.toSpliced(selectedLine, 1, e.target.value.trim()));
  }, 120);

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

  const toc = useMemo(() => getToc(lines.join("\n\n")), [lines]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TOCProvider toc={toc} single={false}>
          <Container>
            <article
              className={cn(
                "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
                "h-fit pt-8 pb-24",
                "prose dark:prose-invert",
                "pr-2 pb-2 pl-4",
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
              <FormField
                control={form.control}
                name="title"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-none"
                        placeholder={t("Please input title")}
                        defaultValue={value}
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
                      className={cn("hover:bg-accent", {
                        group: selectedLine < 0,
                        "my-8 border border-primary bg-accent p-2": selectedLine === i,
                        "cursor-pointer": selectedLine !== i,
                      })}
                      id={`line-${i}`}
                      key={`line-${i}`}
                      onClick={(e) => {
                        if (selectedLine !== i) return setSelectedLine(i);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MdxLoader>{line}</MdxLoader>
                      {selectedLine === i && (
                        <Textarea
                          name="prev"
                          className="mt-2 h-28 resize-none rounded-none"
                          placeholder={t("Please input text here")}
                          defaultValue={lines[selectedLine]}
                          onChange={handleChangeSelectedLine}
                          onKeyDown={handleKeyDownSelectedLine}
                        />
                      )}
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
                className="mt-2 h-28 resize-none rounded-none"
                placeholder={t("Writing a paragraph...")}
                onFocus={() => setSelectedLine(-1)}
                onChange={handleChangeHunk}
                onKeyDown={handleKeyDownHunk}
              />
            </article>

            <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] flex-col space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field: { value, ...field } }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Textarea defaultValue={value} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <nav
                id="nav-toc"
                className="flex h-[calc(100dvh_-(_var(--spacing)_*_(12_+_9_+_1)))] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)]"
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
          </Container>
        </TOCProvider>
      </form>
    </Form>
  );
}

interface SortableProps extends React.ComponentProps<"div"> {
  id: string;
}

function SortableItem({ children, className, ...props }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({
    id: props.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(className, "flex items-center")}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isSorting ? transition : undefined,
      }}
      {...props}
    >
      <div
        className="hidden size-8 shrink-0 cursor-grab px-2 group-hover:flex"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="m-auto size-5" />
      </div>

      <div className="w-[calc(100%_-_(var(--spacing)_*_8))] grow">{children}</div>
    </div>
  );
}
