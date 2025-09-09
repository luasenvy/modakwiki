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
import { Pencil, PencilOff, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { SortableItem } from "@/components/core/MdxEditor/SortableItem";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Textarea } from "@/components/ui/textarea";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { MdxLoader } from "@/lib/mdx/react";
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
  const [uploading, setUploading] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLTextAreaElement>>(new Array(lines.length));

  const handleChangeSelectedLine = debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLines((prev) => prev.toSpliced(selectedLine, 1, e.target.value.trim()));
  }, 110);

  const handleKeyDownSelectedLine = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ("Enter" === e.key && !e.shiftKey) {
      handleChangeSelectedLine.cancel();
      e.preventDefault();

      setLines(lines.toSpliced(selectedLine, 1, ...e.currentTarget.value.trim().split("\n\n")));
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

  const handlePasteChangeLine = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = e.clipboardData.files;
    if (files.length) {
      e.preventDefault();

      if (uploading) return;

      handleChangeSelectedLine.cancel();

      const formData = new FormData();

      for (const file of files) formData.append("files", file);

      const options = { method: "POST", body: formData };

      setUploading(true);
      const res = await fetch("/api/image", options);
      setUploading(false);

      if (!res.ok) return statusMessage({ t, status: res.status, options });

      const uris = await res.json();

      const textarea = inputRefs.current[selectedLine];
      const line = lines[selectedLine];
      const head = line.substring(0, textarea.selectionStart);
      const tail = line.substring(textarea.selectionEnd);

      const imageMarkdown = uris
        .map((uri: string) => `![Uploaded Image](/api/image${uri})`)
        .join("\n\n");
      const text = `${head}\n\n${imageMarkdown}\n\n${tail}`;

      setLines((prev) => prev.toSpliced(selectedLine, 1, text));
      textarea.value = text;
    }
  };

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
                      Array.from(lines.toSpliced(selectedLine, 1, prevSelectedLineContent.current)),
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
  );
}
