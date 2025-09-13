import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { License, licenseImageEnum, licenseLinkEnum } from "@/lib/license";
import { cn } from "@/lib/utils";

interface PageHeadlineProps {
  lng: Language;
  title?: string;
  description?: string;
  author?: { name: string; image?: string; email?: string; emailVerified?: boolean };
  prose?: boolean;
  category?: string;
  license?: License;
  tags?: string[];
  created?: number;
  updated?: number;
}

export async function PageHeadline({
  lng: lngParam,
  title,
  description,
  author,
  prose,
  category,
  license,
  tags,
  created,
  updated,
}: PageHeadlineProps) {
  const { t } = await useTranslation(lngParam);

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

      <div className="sticky top-8 mb-8 flex flex-col items-end gap-0.5 opacity-20 transition-opacity duration-200 ease-in-out hover:opacity-100">
        {license && licenseImageEnum[license] && (
          <a href={licenseLinkEnum[license]} target="_blank" rel="noreferrer noopener">
            <Image
              src={licenseImageEnum[license]}
              alt={t(license)}
              className="!my-0 !w-[91px] !h-[32px]"
              height={32}
              width={91}
            />
          </a>
        )}

        {author && (
          <>
            <AvatarProfile profile={author} size="sm" />
            <p className="!my-0 text-muted-foreground text-xs">{dateFormat.format(created)}</p>
            {updated && created !== updated && (
              <p className="!my-0 text-muted-foreground text-xs">
                {t("Last Modified")}: {dateFormat.format(updated)}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
