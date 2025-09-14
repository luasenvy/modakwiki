"use client";

import { AlignLeft } from "lucide-react";
import Image from "next/image";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { License, licenseImageEnum, licenseLinkEnum } from "@/lib/license";
import { cn } from "@/lib/utils";

interface NavTocProps extends React.PropsWithChildren {
  lng: Language;
  title?: string;
  className?: React.ComponentProps<"nav">["className"];
  author?: { name: string; image?: string; email?: string; emailVerified?: boolean };
  license?: License;
  created?: number;
  updated?: number;
}

export function NavToc({
  lng: lngParam,
  title,
  className,
  author,
  license,
  created,
  updated,
  children,
}: NavTocProps) {
  const { t } = useTranslation(lngParam);

  const dateFormat = new Intl.DateTimeFormat(lngParam, {
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const licenseImage = licenseImageEnum[license!] ?? null;
  const licenseLink = licenseLinkEnum[license!] ?? "#";

  return (
    <nav
      id="nav-toc"
      className={cn(
        "sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col space-y-2 pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden",
        className,
      )}
    >
      {author && (
        <div className="mb-6 flex flex-col items-end gap-1">
          {licenseImage && (
            <a href={licenseLink} target="_blank" rel="noreferrer noopener">
              <Image
                src={licenseImage}
                alt={t(license!)}
                className="!my-0 !w-[91px] !h-[32px]"
                height={32}
                width={91}
              />
            </a>
          )}
          <AvatarProfile profile={author} size="sm" name={`${t("Author")}: ${author.name}`} />
          <p className="!my-0 font-mono text-muted-foreground text-xs">
            {t("First Created")}: {dateFormat.format(created)}
          </p>
          {updated && created !== updated && (
            <p className="!my-0 font-mono text-muted-foreground text-xs">
              {t("Last Modified")}: {dateFormat.format(updated)}
            </p>
          )}
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <AlignLeft className="size-4" />
        <p className="m-0 text-muted-foreground text-sm">{title || t("Table of contents")}</p>
      </div>

      <TOCScrollArea className="mb-2 overflow-auto p-0">
        <TocClerk lng={lngParam} />
      </TOCScrollArea>

      {children}
    </nav>
  );
}
