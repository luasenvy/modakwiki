import { Info } from "lucide-react";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { Document } from "@/components/core/Document";
import { DocumentFilter } from "@/components/core/DocumentFilter";
import { DocumentList } from "@/components/core/DocumentList";
import { Pagination } from "@/components/core/Pagination";
import { isDev } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { doctypeEnum } from "@/lib/schema/document";
import { localePrefix, pickSearchParams } from "@/lib/url";

const pageSize = 10;
export default async function SearchPage(ctx: PageProps<"/[lng]/post">) {
  const searchParams = await ctx.searchParams;

  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  let tags = searchParams.tags || [];

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const counting = knex.count({ count: "*" }).from({ p: "post" }).whereNull("deleted");

  if (search)
    counting.andWhere((q) => {
      q.where("p.title", "ILIKE", `%${search}%`)
        .orWhere("p.description", "ILIKE", `%${search}%`)
        .orWhere("p.content", "ILIKE", `%${search}%`);
    });

  if (category) counting.andWhere("p.category", category);
  if (tags.length) counting.andWhere("p.tags", "&&", tags);

  const selecting = counting
    .clone()
    .clearSelect()
    .select(
      `p.id`,
      `p.title`,
      `p.description`,
      `p.preview`,
      `p.images`,
      `u.name`,
      `u.image`,
      `u.email`,
      "u.emailVerified",
      `p.category`,
      `p.tags`,
      `p.created`,
    )
    .join({ u: "user" }, `p.userId`, `u.id`)
    .orderBy("p.created", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  const [{ count }] = await counting;
  const rows = await selecting;

  const { t } = await useTranslation(lngParam);

  if (rows.length > 0) {
    const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("post"), href: `${lng}/post` }];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Viewport>
          <Container as="div" variant="aside">
            {rows.length > 0 ? (
              <>
                <DocumentFilter
                  lng={lngParam}
                  searchParams={searchParams}
                  type={doctypeEnum.post}
                />
                <DocumentList lng={lngParam} rows={rows} doctype={doctypeEnum.post} />
                <Pagination
                  className="mt-6 sm:col-span-2 lg:col-span-3"
                  page={page}
                  pageSize={pageSize}
                  total={Number(count)}
                  searchParams={searchParams}
                />
              </>
            ) : (
              t("No results found.")
            )}
          </Container>

          <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
            <div className="mb-2 flex items-center gap-2">
              <Info className="size-4" />
              <p className="m-0 text-muted-foreground text-sm">{t("search results")}</p>
            </div>

            <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
              총 {count}개의 포스트가 있습니다.
            </div>

            <Advertisement className="py-6" />
          </div>
        </Viewport>
      </>
    );
  }

  let content = "";
  if (isDev) {
    const baseSearchParams = pickSearchParams(searchParams, ["page", "search", "category", "tags"]);

    baseSearchParams.set("type", doctypeEnum.post);
    baseSearchParams.set("title", String(baseSearchParams.get("search") || ""));
    baseSearchParams.delete("search");

    content = `[${t("Please register the first post!")}](${lng}/editor/write?${baseSearchParams})`;
  }

  const title = t("There is no any post.");
  const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/post` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} title={title} content={content.trim()} />
    </>
  );
}
