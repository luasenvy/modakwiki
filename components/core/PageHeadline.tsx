import { CheckCircle, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
          <div className="flex items-center space-x-1">
            <Avatar className="size-5 rounded-full">
              {author.image && (
                <AvatarImage className="!my-0" src={author.image} alt={author.name} />
              )}
              <AvatarFallback className="rounded-full text-xs">
                {author.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <p className="!my-0 text-sm">
              {author.email ? (
                <a
                  href={`mailto:${author.email}`}
                  className="text-blue-500 text-xs no-underline hover:underline"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {author.name}
                </a>
              ) : (
                <span className="text-muted-foreground">{author.name}</span>
              )}
              {author.emailVerified && (
                <CheckCircle className="ml-1 inline size-3 text-green-600" />
              )}
            </p>
          </div>

          <p className="!my-1 text-muted-foreground text-xs">{dateFormat.format(created)}</p>
        </div>
      )}
    </>
  );
}
