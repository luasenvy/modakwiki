import { CheckCircle, CheckCircleIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pill,
  PillAvatar,
  PillAvatarGroup,
  PillButton,
  PillDelta,
  PillIcon,
  PillIndicator,
  PillStatus,
} from "@/components/ui/shadcn-io/pill";
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

  return rows.map(
    ({ id, title, preview, type, name, email, image, emailVerified, category, tags, created }) => {
      return (
        <div className="py-0.5 hover:bg-accent" key={id}>
          {category && (
            <p className="text-xs">
              <span className="font-semibold">{category}</span>
              {Boolean(tags?.length) && (
                <>
                  <ChevronRight className="inline size-2.5" />
                  {tags?.join(", ")}
                </>
              )}
            </p>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="mt-0 mb-1 font-semibold text-xl">
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
              <AvatarProfile profile={{ name, email, image, emailVerified }} size="sm" />

              <p className="!my-0 text-xs">{datetimeFormat.format(created)}</p>
            </div>

            <p className="mt-3 text-muted-foreground text-sm">{preview}...</p>
          </div>
        </div>
      );
    },
  );
}
