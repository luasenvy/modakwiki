import { cn } from "@/lib/utils";

interface PageHeadlineProps {
  title?: string;
  description?: string;
  prose?: boolean;
}

export function PageHeadline({ title, description, prose }: PageHeadlineProps) {
  return (
    <div className={cn({ "prose dark:prose-invert": prose })}>
      {title && <h1 className={cn("my-8", { "!mb-1": Boolean(description) })}>{title}</h1>}
      {description && (
        <h2 className="!m-0 !mb-8 font-semibold text-lg text-muted-foreground">{description}</h2>
      )}
    </div>
  );
}
