import { Info } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentList } from "@/components/core/DocumentList";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document, doctypeEnum } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export default async function SearchPage(ctx: PageProps<"/[lng]/search">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);
  const term = (await ctx.searchParams).term;

  const client = await pool.connect();
  try {
    const {
      rows: [{ count: docCount }, { count: essayCount }],
    } = await client.query<{ count: number }>(
      `SELECT count
         FROM (
             SELECT COUNT(*) AS count
               FROM document
              WHERE deleted IS NULL AND (title like $1 OR content like $1)
             
             UNION ALL
 
             SELECT COUNT(*) AS count
               FROM essay
              WHERE deleted IS NULL AND (title like $1 OR content like $1)
         )`,
      [`%${term}%`],
    );

    const { rows } = await client.query<Document & { type: Doctype }>(
      `SELECT id, title, preview, '${doctypeEnum.document}' AS type
         FROM document
        WHERE deleted IS NULL
          AND (title like $1 OR content like $1)
       
       UNION ALL

       SELECT id, title, preview, '${doctypeEnum.essay}' AS type
         FROM essay
        WHERE deleted IS NULL
          AND (title like $1 OR content like $1)`,
      [`%${term}%`],
    );

    const { t } = await useTranslation(lngParam);
    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: t("editor") },
      { title: t("search"), href: `${lng}/search` },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />

        <Viewport>
          <Container as="div" variant="aside">
            {rows.length > 0 ? (
              <DocumentList lng={lngParam} rows={rows} showDoctype />
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
              총 {docCount}개 문서와 {essayCount}개 기고가 검색되었습니다.
            </div>

            <Advertisement className="py-6" />
          </div>
        </Viewport>
      </>
    );
  } finally {
    client.release();
  }
}
