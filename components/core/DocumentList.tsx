import Link from "next/link";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  lng: Language;
  rows: Array<Document & { type?: Doctype }>;
  showDoctype?: boolean;
  doctype?: Doctype;
}

export async function DocumentList({
  lng: lngParam,
  rows,
  showDoctype,
  doctype,
}: DocumentListProps) {
  const { t } = await useTranslation(lngParam);
  const lng = localePrefix(lngParam);

  return (
    <div
      className={cn(
        "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
        "h-fit space-y-14",
        "pt-8 pr-2 pb-24 pl-4 max-lg:pr-4",
      )}
    >
      {rows.map(({ id, title, preview, type }) => (
        <div className="prose dark:prose-invert max-w-none" key={id}>
          <h2 className="mb-1 font-semibold text-xl">
            <Link
              key={id}
              href={`${lng}/${type || doctype}?${new URLSearchParams({ id })}`}
              className="text-blue-500 no-underline hover:underline"
            >
              {title}
              {showDoctype && type && <sub> ({t(type)})</sub>}
            </Link>
          </h2>

          <p className="text-muted-foreground text-sm">{preview}...</p>
        </div>
      ))}
    </div>
  );
}
