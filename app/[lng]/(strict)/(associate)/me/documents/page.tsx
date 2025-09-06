import { Info } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "내 정보", href: `${lng}/me` },
    { title: "문서함", href: `${lng}/me/documents` },
  ];

  const client = await pool.connect();
  try {
    const {
      rows: [{ count }],
    } = await client.query<{ count: number }>(
      `SELECT SUM(total_count) AS count
         FROM (
           SELECT COUNT(*) AS total_count
             FROM document
             WHERE deleted IS NULL AND email = $1
           
           UNION ALL
 
           SELECT COUNT(*) AS total_count
             FROM essay
            WHERE deleted IS NULL AND email = $1
         )`,
      [session.user.email],
    );

    const { rows } = await client.query<DocumentType & { type: Doctype }>(
      `SELECT id, title, preview, '${doctypeEnum.document}' AS type
         FROM document
         WHERE deleted IS NULL AND email = $1
       
       UNION ALL

       SELECT id, title, preview, '${doctypeEnum.essay}' AS type
         FROM essay
       WHERE deleted IS NULL AND email = $1`,
      [session.user.email],
    );

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Viewport>
          <Container
            as="div"
            className={cn(
              "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
              "h-fit",
              "pr-2 pl-4 max-lg:pr-4",
            )}
          >
            {rows.map(({ id, title, type, preview }) => (
              <div className="prose dark:prose-invert max-w-none" key={id}>
                <h2 className="mb-1 font-semibold text-xl">
                  <Link
                    key={id}
                    href={`${lng}/${type}?${new URLSearchParams({ id })}`}
                    className="text-blue-500 no-underline hover:underline"
                  >
                    {title}
                  </Link>
                </h2>

                <p className="text-muted-foreground text-sm">{preview}...</p>
              </div>
            ))}
          </Container>

          <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
            <div className="mb-2 flex items-center gap-2">
              <Info className="size-4" />
              <p className="m-0 text-muted-foreground text-sm">검색결과</p>
            </div>

            <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
              총 {count}개 문서가 보관되어 있습니다.
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
