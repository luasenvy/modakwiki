import { ChevronRight } from "lucide-react";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Language } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface PageHeadlineProps {
  lng: Language;
  title?: string;
  description?: string;
  author?: { name: string; image?: string; email?: string; emailVerified?: boolean };
  prose?: boolean;
  category?: string;
  tags?: string[];
  created?: number;
}

export async function PageHeadline({
  lng: lngParam,
  title,
  description,
  author,
  prose,
  category,
  tags,
  created,
}: PageHeadlineProps) {
  const dateFormat = new Intl.DateTimeFormat(lngParam, {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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
          <h2
            className={cn("!m-0 !mb-8 font-semibold text-lg text-muted-foreground", {
              "!mb-1": Boolean(author),
            })}
          >
            {description}
          </h2>
        )}
      </div>

      {author && (
        <div className="mb-8 flex w-full flex-col items-end">
          <AvatarProfile profile={author} size="sm" />
          <p className="!my-0 text-muted-foreground text-xs">{dateFormat.format(created)}</p>
        </div>
      )}
    </>
  );
}
