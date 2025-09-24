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
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { getSearchParamsFromObject, localePrefix, pickSearchParams } from "@/lib/url";

const pageSize = 10;
export default async function SearchPage(ctx: PageProps<"/[lng]/essay">) {
  const searchParams = await ctx.searchParams;

  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  let tags = searchParams.tags || [];

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const client = await pool.connect();
  try {
    const {
      rows: [{ count }],
    } = await client.query<{ count: number }>(
      `SELECT COUNT(*) AS count
         FROM essay e
        WHERE e.deleted IS NULL
        ${
          search
            ? `AND ( e.title ILIKE '%${search}%'
                  OR e.description ILIKE '%${search}%'
                  OR e.content ILIKE '%${search}%'
               )`
            : ""
        }
        ${category ? `AND e.category = '${category}'` : ""}
        ${tags.length ? `AND e.tags && '{${tags.map((t) => `"${t}"`).join(",")}}'` : ""}`,
    );

    const { rows } = await client.query<DocumentType & User & { type: Doctype }>(
      `SELECT e.id
            , e.title
            , e.description
            , e.preview
            , e.images
            , u.name
            , u.image
            , u."email"
            , u."emailVerified"
            , e.category
            , e.tags
            , e.created
         FROM essay e
         JOIN "user" u ON e."userId" = u.id
        WHERE e.deleted IS NULL
        ${
          search
            ? `AND ( e.title ILIKE '%${search}%'
                  OR e.description ILIKE '%${search}%'
                  OR e.content ILIKE '%${search}%'
              )`
            : ""
        }
        ${category ? `AND e.category = '${category}'` : ""}
        ${tags.length ? `AND e.tags && '{${tags.map((t) => `"${t}"`).join(",")}}'` : ""}
     ORDER BY e.created DESC
       OFFSET ${(page - 1) * pageSize} LIMIT ${pageSize}`,
    );

    const { t } = await useTranslation(lngParam);

    if (rows.length > 0) {
      const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("wiki essay"), href: `${lng}/essay` }];

      return (
        <>
          <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
          <Viewport>
            <Container as="div" variant="aside">
              {rows.length > 0 ? (
                <>
                  <DocumentFilter lng={lngParam} searchParams={searchParams} />
                  <DocumentList lng={lngParam} rows={rows} doctype={doctypeEnum.essay} />
                  <Pagination
                    className="mt-6 sm:col-span-2 lg:col-span-3"
                    page={page}
                    pageSize={pageSize}
                    total={count}
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
                <p className="m-0 text-muted-foreground text-sm">검색결과</p>
              </div>

              <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
                총 {count}개의 기고가 있습니다.
              </div>

              <Advertisement className="py-6" />
            </div>
          </Viewport>
        </>
      );
    }

    let content = "";
    if (isDev) {
      const baseSearchParams = pickSearchParams(searchParams, [
        "page",
        "search",
        "category",
        "tags",
      ]);

      baseSearchParams.set("type", doctypeEnum.essay);
      baseSearchParams.set("title", String(baseSearchParams.get("search") || ""));
      baseSearchParams.delete("search");

      content = `[${t("Please register the first essay!")}](${lng}/editor/write?${baseSearchParams})`;
    }

    const title = t("There is no any essay.");
    const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/essay` }];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Document lng={lngParam} title={title} content={content.trim()} />
      </>
    );
  } finally {
    client.release();
  }
}
