import { ChevronRight, Info } from "lucide-react";
import { SearchParams } from "next/dist/server/request/search-params";
import Link from "next/link";
import { AvatarProfile } from "@/components/core/AvatarProfile";
import { Pagination } from "@/components/core/Pagination";
import { HoverCardContentImageDetail } from "@/components/mdx/Image";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import {
  Doctype,
  Document as DocumentType,
  doctypeEnum,
  getTablesByDoctype,
} from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  lng: Language;
  user?: User;
  search?: string | string[];
  category?: string | string[];
  tags?: string | Array<string>;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
  doctype?: Doctype;
  searchParams?: SearchParams;
}

export async function DocumentList({
  lng: lngParam,
  user,
  search,
  category,
  tags = [],
  doctype = doctypeEnum.document,
  pagination = {},
  searchParams = {},
}: DocumentListProps) {
  const lng = localePrefix(lngParam);
  const datetimeFormat = new Intl.DateTimeFormat(lngParam);
  const { t } = await useTranslation(lngParam);

  if (!pagination.page) pagination.page = 1;
  if (!pagination.pageSize) pagination.pageSize = 10;

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const { table } = getTablesByDoctype(doctype);
  const counting = knex.count({ count: "*" }).from({ p: table! }).whereNull("deleted");

  if (search) {
    counting.andWhere((q) => {
      q.where("p.title", "ILIKE", `%${search}%`)
        .orWhere("p.description", "ILIKE", `%${search}%`)
        .orWhere("p.content", "ILIKE", `%${search}%`);
    });
  }

  if (category) counting.andWhere("p.category", category);
  if (tags.length) counting.andWhere("p.tags", "&&", tags);
  if (user) counting.andWhere("p.userId", user.id);

  const selecting = counting
    .clone()
    .clearSelect()
    .select({
      id: `p.id`,
      title: `p.title`,
      description: `p.description`,
      preview: `p.preview`,
      type: knex.raw(`'${doctype}'`),
      images: `p.images`,
      name: `u.name`,
      image: `u.image`,
      email: `u.email`,
      emailVerified: "u.emailVerified",
      category: `p.category`,
      tags: `p.tags`,
      created: `p.created`,
    })
    .join({ u: "user" }, `p.userId`, `u.id`)
    .offset((pagination.page - 1) * pagination.pageSize)
    .limit(pagination.pageSize);

  const [{ count }] = await counting;
  const rows: Array<DocumentType & User & { type: Doctype }> = await selecting;

  return rows.length > 0 ? (
    <>
      {rows.map(
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
            <div className="p-2 hover:bg-accent/40" key={id}>
              {category && (
                <div className="flex items-center">
                  <span className="font-semibold text-xs">{t(category)}</span>
                  {Boolean(tags?.length) && (
                    <>
                      <ChevronRight className="mx-0.5 inline size-2.5" />
                      <span className="text-muted-foreground text-xs">
                        {tags?.map((tag) => t(tag)).join(", ")}
                      </span>
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
                    </Link>
                  </h2>

                  <p className="!my-0.5 text-muted-foreground text-sm">{description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <AvatarProfile
                    lng={lngParam}
                    profile={{ name, email, image, emailVerified } as User}
                    size="sm"
                  />

                  <p className="!my-0 text-xs">
                    {datetimeFormat.format(Number(updated || created))}
                  </p>
                </div>

                <div>
                  <p className="!my-0 text-muted-foreground text-sm">{preview}...</p>
                </div>

                {Boolean(images?.length) && (
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto overflow-y-hidden">
                    {images!.map((src, index) => (
                      <figure
                        key={index}
                        className="!m-0 relative w-fit rounded-md border shadow-sm"
                      >
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
                            <HoverCardContentImageDetail lng={lngParam} src={src} />
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
      )}
      <Pagination
        className="mt-6 sm:col-span-2 lg:col-span-3"
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={Number(count)}
        searchParams={searchParams}
      />
    </>
  ) : (
    <div className="p-4 text-center text-muted-foreground text-sm">{t("No results found.")}</div>
  );
}
