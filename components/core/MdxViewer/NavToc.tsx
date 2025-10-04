"use client";

import { AlignLeft } from "lucide-react";
import { TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

interface NavTocProps extends React.PropsWithChildren {
  lng: Language;
  title?: string;
  className?: React.ComponentProps<"nav">["className"];
}

export function NavToc({ lng: lngParam, title, className, children }: NavTocProps) {
  const { t } = useTranslation(lngParam);

  return (
    <nav
      id="nav-toc"
      className={cn(
        "sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col space-y-2 pt-18 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden xl:pt-8",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <AlignLeft className="size-4" />
        <p
          className="m-0 truncate text-muted-foreground text-sm transition-colors hover:text-accent-foreground"
          title={title || t("Table of contents")}
        >
          <a href="#doc-title">{title || t("Table of contents")}</a>
        </p>
      </div>

      <TOCScrollArea className="mb-2 overflow-auto p-0">
        <TocClerk lng={lngParam} />
      </TOCScrollArea>

      {children}
    </nav>
  );
}
