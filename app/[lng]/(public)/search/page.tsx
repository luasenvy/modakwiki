import { Info } from "lucide-react";
import Link from "next/link";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container } from "@/components/core/Container";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Document } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export default async function SearchPage(ctx: PageProps<"/[lng]/search">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);
  const term = (await ctx.searchParams).term;

  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query<Document>(
      `SELECT id, title, type, preview
         FROM document
        WHERE deleted IS NULL
          AND (title like $1 OR content like $1)`,
      [`%${term}%`],
    );

    return (
      <Container>
        <div
          className={cn(
            "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
            "h-fit",
            "pt-8 pr-2 pb-24 pl-4 max-lg:pr-4",
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
        </div>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">검색결과</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
            총 {rowCount}개 문서가 검색되었습니다.
          </div>

          <Advertisement className="py-6" />
        </div>
      </Container>
    );
  } finally {
    client.release();
  }
}
