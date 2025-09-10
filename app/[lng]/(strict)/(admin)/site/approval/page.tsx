import { Info } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { Document } from "@/components/core/Document";
import { DocumentList } from "@/components/core/DocumentList";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export default async function SearchPage(ctx: PageProps<"/[lng]/site/approval">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const client = await pool.connect();
  try {
    const {
      rows: [{ count: docCount }, { count: essayCount }],
    } = await client.query<{ count: number }>(
      `SELECT count
         FROM (
             SELECT COUNT(*) AS count
               FROM document
              WHERE approved IS NULL AND deleted IS NULL

             UNION ALL
 
             SELECT COUNT(*) AS count
               FROM essay
              WHERE approved IS NULL AND deleted IS NULL
         )`,
    );

    const { rows } = await client.query<DocumentType & User & { type: Doctype }>(
      `SELECT e.id, e.title, e.preview, u.name, u.image, u."email", u."emailVerified", e.category, e.tags, e.created
         FROM "essay" e
         JOIN "user" u ON e."userId" = u.id
        WHERE e.approved IS NULL AND e.deleted IS NULL`,
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
                <DocumentList lng={lngParam} rows={rows} doctype={doctypeEnum.essay} />
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
                총 {docCount}개 문서와 {essayCount}개의 기고가 승인을 바라고 있습니다.
              </div>

              <Advertisement className="py-6" />
            </div>
          </Viewport>
        </>
      );
    }

    const title = t("All documents have been reviewed!");
    const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/site/approval` }];
    // const content  = ``.trim()
    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Document lng={lngParam} title={title} />
      </>
    );
  } finally {
    client.release();
  }
}
