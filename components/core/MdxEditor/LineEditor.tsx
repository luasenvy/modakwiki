"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import debounce from "lodash.debounce";
import { ChevronDown, ChevronUp, Pencil, PencilOff, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SortableItem } from "@/components/core/MdxEditor/SortableItem";
import { ImageSelectButton } from "@/components/pages/site/image/ImageSelectButton";
import { ImageUploadAPI, ImageUploadButton } from "@/components/pages/site/image/ImageUploadButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Textarea } from "@/components/ui/textarea";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { MdxLoader } from "@/lib/mdx/react";
import { trailingFootnotes } from "@/lib/mdx/utils";
import { Image, Image as ImageType } from "@/lib/schema/image";
import { cn } from "@/lib/utils";

interface LineEditorProps {
  lng: Language;
  lines: string[];
  setLines: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLine: number;
  setSelectedLine: React.Dispatch<React.SetStateAction<number>>;
}

export function LineEditor({
  lng: lngParam,
  lines,
  setLines,
  selectedLine,
  setSelectedLine,
}: LineEditorProps) {
  const { t } = useTranslation(lngParam);
  const uploadingState = useState<boolean>(false);
  const [uploading] = uploadingState;

  const inputRefs = useRef<Array<HTMLTextAreaElement>>(new Array(lines.length));
  const imageUploadRef = useRef<ImageUploadAPI>(null);

  const handleChangeSelectedLine = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLines((prev) =>
      prev.toSpliced(selectedLine, 1, trailingFootnotes(e.target.value.trim(), true)),
    );
  }, 110);

  const handleKeyDownSelectedLine = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeSelectedLine.cancel();
      e.preventDefault();

      setLines(
        lines.toSpliced(
          selectedLine,
          1,
          ...trailingFootnotes(e.currentTarget.value.trim(), true).split("\n\n"),
        ),
      );
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

  const prevSelectedLineContent = useRef<string>("");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const handleSave = async (res: Response) => {
    handleChangeSelectedLine.cancel();

    if (!res.ok) return toast.error(await res.text());

    const saves: Image[] = await res.json();

    const textarea = inputRefs.current[selectedLine];
    const line = lines[selectedLine];
    const head = line.substring(0, textarea.selectionStart);
    const tail = line.substring(textarea.selectionEnd);

    const imageMarkdown = saves
      .map(
        ({ uri, name, width, height }) =>
          `![${name} width-${width} height-${height}](/api/image${uri})`,
      )
      .join("\n\n");
    const text = `${head}\n\n${imageMarkdown}\n\n${tail}`;

    setLines((prev) => prev.toSpliced(selectedLine, 1, text));
    textarea.value = text;
  };

  const handleSelectImage = (image: ImageType) => {
    const textarea = inputRefs.current[selectedLine];
    if (!textarea) return;

    const line = lines[selectedLine];
    const head = line.substring(0, textarea.selectionStart);
    const tail = line.substring(textarea.selectionEnd);

    const curr = `${head}\n\n![${image.name} width-${image.width} height-${image.height}](/api/image${image.uri}-o)\n\n${tail}`;

    setLines((prev) => prev.toSpliced(selectedLine, 1, curr));
    textarea.value = curr;
  };

  const handlePasteChangeLine = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData.files;
    if (!files.length) return;

    e.preventDefault();

    const res = await imageUploadRef.current!.upload(files);

    if (!res.ok) return toast.error(await res.text());
    const saves: Image[] = await res.json();

    const textarea = inputRefs.current[selectedLine];
    const line = lines[selectedLine];
    const head = line.substring(0, textarea.selectionStart);
    const tail = line.substring(textarea.selectionEnd);

    const imageMarkdown = saves
      .map(
        ({ uri, name, width, height }) =>
          `![${name} width-${width} height-${height}](/api/image${uri})`,
      )
      .join("\n\n");
    const text = `${head}\n\n${imageMarkdown}\n\n${tail}`;

    setLines((prev) => prev.toSpliced(selectedLine, 1, text));
    textarea.value = text;
  };

  useEffect(() => {
    inputRefs.current[selectedLine]?.focus();
  }, [selectedLine]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
            <MdxLoader source={line} />
            {selectedLine === i && (
              <div className="relative">
                <Textarea
                  ref={(el) => {
                    inputRefs.current[i] = el as HTMLTextAreaElement;
                  }}
                  name="prev"
                  className="mt-2 h-fit max-h-56 min-h-28 resize-none rounded-none font-mono"
                  placeholder={t("Please input text here")}
                  defaultValue={lines[selectedLine]}
                  onChange={handleChangeSelectedLine}
                  onKeyDown={handleKeyDownSelectedLine}
                  onPaste={handlePasteChangeLine}
                />

                <div className="mt-1 flex items-center justify-end gap-1">
                  <ImageUploadButton
                    ref={imageUploadRef}
                    lng={lngParam}
                    uploadingState={uploadingState}
                    onSave={handleSave}
                  />
                  <ImageSelectButton lng={lngParam} onSelect={handleSelectImage} />
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
            )}

            <div className="absolute top-0 right-0 hidden items-center bg-background shadow-sm group-hover/line:flex">
              <div>
                {i > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    title={t("한 문단 위로")}
                    className="!bg-transparent !text-blue-600 hover:!bg-accent !rounded-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      const toLines = lines.toSpliced(i - 1, 2, lines[i], lines[i - 1]);
                      setLines(toLines);
                      setSelectedLine(i - 1);

                      setTimeout(() => {
                        const prev = inputRefs.current[i - 1];
                        const curr = inputRefs.current[i];

                        if (prev) prev.value = toLines[i - 1];
                        if (curr) curr.value = toLines[i];
                      });
                    }}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  title={t("한 문단 아래로")}
                  className="!bg-transparent !text-blue-600 hover:!bg-accent !rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    const toLines = lines.toSpliced(i, 2, lines[i + 1], lines[i]);
                    setLines(toLines);
                    setSelectedLine(i + 1);
                    setTimeout(() => {
                      const prev = inputRefs.current[i];
                      const curr = inputRefs.current[i + 1];

                      if (prev) prev.value = toLines[i];
                      if (curr) curr.value = toLines[i + 1];
                    });
                  }}
                >
                  <ChevronDown className="size-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="!h-4 mx-2 w-px" />

              <div>
                {selectedLine === i ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    title={t("Cancel Edit")}
                    className="hover:!bg-accent !rounded-none !bg-transparent !text-orange-500 hover:!text-orange-600"
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
                    className="hover:!bg-accent !rounded-none !bg-transparent !text-orange-500 hover:!text-orange-600"
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
                  className="hover:!bg-accent !rounded-none !bg-transparent hover:!text-rose-600 text-rose-500"
                  type="button"
                  title={t("Remove Paragraph")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLine(-1);
                    setTimeout(() => setLines((prev) => prev.filter((_, index) => index !== i)));
                  }}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
