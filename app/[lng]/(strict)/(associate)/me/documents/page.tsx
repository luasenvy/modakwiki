import { Info } from "lucide-react";
import { headers } from "next/headers";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentList } from "@/components/core/DocumentList";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "내 정보", href: `${lng}/me` },
    { title: "문서함", href: `${lng}/me/documents` },
  ];

  const [{ count: docCount }, { count: essayCount }] = await knex.select("o.count").fromRaw(
    knex.raw(
      `(
         SELECT COUNT(*) AS count
           FROM document
          WHERE deleted IS NULL
            AND "userId" = :userId
        
        UNION ALL

        SELECT COUNT(*) AS count
          FROM essay
        WHERE deleted IS NULL
          AND "userId" = :userId
       ) as o`,
      { userId: session.user.id },
    ),
  );

  const rows = await knex
    .select<Array<DocumentType & User & { type?: Doctype }>>({
      id: "o.id",
      title: "o.title",
      preview: "o.preview",
      type: "o.type",
      name: "o.name",
      image: "o.image",
      email: "o.email",
      emailVerified: "o.emailVerified",
    })
    .fromRaw(
      knex.raw(
        `(
           SELECT d.id
                , d.title
                , d.preview
                , '${doctypeEnum.document}' AS type
                , u.name
                , u.image
                , u.email
                , u."emailVerified"
             FROM document d
             JOIN "user" u
               ON d."userId" = u.id
             WHERE d.deleted IS NULL
               AND d."userId" = :userId
         
         UNION ALL
  
            SELECT e.id
                 , e.title
                 , e.preview
                 , '${doctypeEnum.essay}' AS type
                 , u.name
                 , u.image
                 , u.email
                 , u."emailVerified"
              FROM essay e
              JOIN "user" u
                ON e."userId" = u.id
             WHERE e.deleted IS NULL
               AND e."userId" = :userId
        )`,
        { userId: session.user.id },
      ),
    );

  const { t } = await useTranslation(lngParam);

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
            총 {docCount}개 문서와 {essayCount}개 기고가 있습니다.
          </div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
