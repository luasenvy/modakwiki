import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AvatarProfile } from "@/components/core/AvatarProfile";

import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

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

  return rows.map(
    ({
      id,
      title,
      preview,
      type,
      name,
      email,
      image,
      emailVerified,
      category,
      tags,
      images,
      created,
      updated,
    }) => {
      return (
        <div className="space-y-2 p-2 hover:bg-accent" key={id}>
          {category && (
            <div className="mb-0 flex items-center">
              <span className="font-semibold text-xs">{category}</span>
              {Boolean(tags?.length) && (
                <>
                  <ChevronRight className="inline size-2.5" />
                  <span className="text-xs">{tags?.join(", ")}</span>
                </>
              )}
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none space-y-1">
            <h2 className="!my-0 font-semibold text-xl">
              <Link
                key={id}
                href={`${lng}/${type || doctype}?${new URLSearchParams({ id })}`}
                className="text-blue-600 no-underline hover:underline"
              >
                {title}
                {showDoctype && type && <sub> ({t(type)})</sub>}
              </Link>
            </h2>

            <div className="flex items-center justify-between">
              <AvatarProfile profile={{ name, email, image, emailVerified }} size="sm" />

              <p className="!my-0 text-xs">{datetimeFormat.format(updated || created)}</p>
            </div>

            <p className="!my-0 text-muted-foreground text-sm">{preview}...</p>

            {Boolean(images?.length) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {images!.map((src, index) => (
                  <div
                    key={index}
                    className="relative size-20 overflow-hidden rounded-md border bg-center bg-cover bg-no-repeat shadow-sm"
                    style={{ backgroundImage: `url('${src}')` }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    },
  );
}
