import { ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { HoverCardContentImageDetail } from "@/components/mdx/Image";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
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

  return rows.length > 0 ? (
    rows.map(
      ({
        id,
        title,
        description,
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
          <div className="p-2 hover:bg-accent" key={id}>
            {category && (
              <div className="flex items-center">
                <span className="font-semibold text-xs">{category}</span>
                {Boolean(tags?.length) && (
                  <>
                    <ChevronRight className="inline size-2.5" />
                    <span className="text-xs">{tags?.join(", ")}</span>
                  </>
                )}
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none space-y-2">
              <div>
                <h2 className="!my-0.5 font-semibold text-xl">
                  <Link
                    key={id}
                    href={`${lng}/${type || doctype}?${new URLSearchParams({ id })}`}
                    className="text-blue-600 no-underline hover:underline"
                  >
                    {title}
                    {showDoctype && type && <sub> ({t(type)})</sub>}
                  </Link>
                </h2>

                <p className="!my-0.5 text-muted-foreground text-sm">{description}</p>
              </div>

              <div className="flex items-center justify-between">
                <AvatarProfile profile={{ name, email, image, emailVerified } as User} size="sm" />

                <p className="!my-0 text-xs">{datetimeFormat.format(Number(updated || created))}</p>
              </div>

              <div>
                <p className="!my-0 text-muted-foreground text-sm">{preview}...</p>
              </div>

              {Boolean(images?.length) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {images!.map((src, index) => (
                    <figure key={index} className="!m-0 relative w-fit rounded-md border shadow-sm">
                      <ImageZoom zoomImg={{ src: src.replace(/-t$/, "-o") }} zoomMargin={40}>
                        <div
                          role="img"
                          className="relative size-20 rounded-md bg-center bg-cover bg-no-repeat"
                          style={{ backgroundImage: `url('${src}')` }}
                        ></div>
                      </ImageZoom>

                      <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                              "absolute top-1 right-1 size-5 shadow-md",
                              "!border-amber-600 rounded-full",
                              "shrink-0 text-amber-600",
                            )}
                          >
                            <Info className="size-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <HoverCardContentImageDetail src={src} />
                        </HoverCardContent>
                      </HoverCard>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      },
    )
  ) : (
    <div className="p-4 text-center text-muted-foreground text-sm">{t("No results found.")}</div>
  );
}
