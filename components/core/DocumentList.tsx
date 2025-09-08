import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  lng: Language;
  rows: Array<Document & User & { type?: Doctype }>;
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

  const datetimeFormat = new Intl.DateTimeFormat(lngParam);

  return rows.map(({ id, title, preview, type, name, email, image, emailVerified, created }) => (
    <div className={cn("prose dark:prose-invert max-w-none", "hover:bg-accent")} key={id}>
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

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Avatar className="size-6 rounded-full">
            {image && <AvatarImage className="!m-0" src={image} alt={name} />}
            <AvatarFallback className="rounded-full">{name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <p className="!my-0 text-xs">
            <a
              href={`mailto:${email}`}
              className="text-blue-500 no-underline hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </a>
            {emailVerified && <CheckCircle className="ml-0.5 inline size-2.5 text-green-600" />}
          </p>
        </div>

        <p className="!my-0 text-xs">{datetimeFormat.format(created)}</p>
      </div>

      <p className="mt-3 text-muted-foreground text-sm">{preview}...</p>
    </div>
  ));
}
