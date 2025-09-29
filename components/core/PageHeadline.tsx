import { TFunction } from "i18next";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Language } from "@/lib/i18n/config";
import { License, licenseImageEnum, licenseLinkEnum } from "@/lib/license";
import { User } from "@/lib/schema/user";
import { cn } from "@/lib/utils";

interface PageHeadlineProps {
  t: TFunction;
  title?: string;
  description?: string;
  prose?: boolean;
  category?: string;
  tags?: string[];
  author?: User;
  license?: License;
  className?: React.ComponentProps<"div">["className"];
}

export async function PageHeadline({
  t,
  title,
  description,
  prose,
  category,
  tags,
  author,
  license,
  className,
}: PageHeadlineProps) {
  return (
    <>
      <div className={cn({ "prose dark:prose-invert": prose }, className)}>
        {title && (
          <h1 id="doc-title" className="mb-2 text-center">
            {title}
          </h1>
        )}
        {description && (
          <h2 className="!m-0 text-center font-semibold text-lg text-muted-foreground">
            {description}
          </h2>
        )}
      </div>

      <div className="my-6 flex flex-col items-end gap-y-1">
        {category && (
          <div className="flex items-center">
            <span className="font-semibold text-xs">{category}</span>
            {Boolean(tags?.length) && (
              <>
                <ChevronRight className="mx-0.5 inline size-2.5" />
                <span className="text-muted-foreground text-xs">{tags?.join(", ")}</span>
              </>
            )}
          </div>
        )}

        {author && <AvatarProfile profile={author} size="sm" name={author.name} />}

        {license && (
          <a
            href={licenseLinkEnum[license]}
            target="_blank"
            rel="noreferrer noopener"
            title={t(license)}
          >
            <Image
              src={licenseImageEnum[license]}
              alt={t(license)}
              className="!my-0 !w-[69px] !h-[24px]"
              width={69}
              height={24}
            />
          </a>
        )}
      </div>
    </>
  );
}
