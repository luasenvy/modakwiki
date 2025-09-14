import { ChevronRight } from "lucide-react";
import { Language } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface PageHeadlineProps {
  title?: string;
  description?: string;
  prose?: boolean;
  category?: string;
  tags?: string[];
}

export async function PageHeadline({
  title,
  description,
  prose,
  category,
  tags,
}: PageHeadlineProps) {
  return (
    <>
      {category && (
        <p className="!my-0 text-xs">
          <span className="font-semibold">{category}</span>
          {Boolean(tags?.length) && (
            <>
              <ChevronRight className="inline size-2.5" />
              {tags?.join(", ")}
            </>
          )}
        </p>
      )}

      <div className={cn({ "prose dark:prose-invert": prose })}>
        {title && <h1 className={cn("my-8", { "!mb-1": Boolean(description) })}>{title}</h1>}
        {description && (
          <h2 className="!m-0 !mb-8 font-semibold text-lg text-muted-foreground">{description}</h2>
        )}
      </div>
    </>
  );
}
