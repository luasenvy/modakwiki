"use client";

import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

interface SortableProps extends React.ComponentProps<"div"> {
  lng: Language;
  id: string;
}

export function SortableItem({ lng: lngParam, children, className, ...props }: SortableProps) {
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
        className="mr-2 mb-auto hidden size-10 shrink-0 cursor-grab bg-blue-500/50 px-2 hover:bg-blue-500/60 active:bg-blue-500 group-hover:flex"
        title={t("Drag to change order")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="m-auto size-4" />
      </div>

      <div className="w-[calc(100%_-_(var(--spacing)_*_8))] grow">{children}</div>
    </div>
  );
}
