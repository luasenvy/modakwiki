import { Info } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentFilter } from "@/components/core/DocumentFilter";
import { DocumentList } from "@/components/core/DocumentList";
import { SeriesPageList } from "@/components/core/SeriesPageList";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, doctypeEnum, getTablesByDoctype } from "@/lib/schema/document";
import { Series } from "@/lib/schema/series";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export async function generateMetadata(ctx: PageProps<"/[lng]/list">) {
  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  return {
    title: t("Series Pages List"),
    description: t("View or search pages in the series."),
  };
}

const pageSize = 10;
export default async function SeriesPagesListPage(ctx: PageProps<"/[lng]/series/pages">) {
  const searchParams = await ctx.searchParams;

  const page = Number(searchParams.page ?? "1");

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("Series Pages List"), href: `${lng}/series/pages` },
  ];

  const { series } = getTablesByDoctype(searchParams.type as Doctype);
  const doc: Series = await knex
    .select(["title", "description", "cover"])
    .from(series!)
    .whereNull("deleted")
    .andWhere({ id: searchParams.id })
    .first();

  if (!doc) return notFound();

  const { title, description, cover } = doc;

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          <div className="prose dark:prose-invert max-w-none">
            <div
              className="series-header flex min-h-44 flex-col items-center justify-center bg-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url('/api/image${cover?.replace(/-t$/, "-o")}')`,
              }}
            >
              {title && <h1 className="mb-2 text-center text-shadow-lg text-white"> {title} </h1>}
              {description && (
                <h2 className="!m-0 text-center font-semibold text-lg text-shadow-lg text-white">
                  {description}
                </h2>
              )}
            </div>
          </div>

          <SeriesPageList
            lng={lngParam}
            searchParams={searchParams}
            pagination={{ page, pageSize }}
          />
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">{t("search results")}</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]"></div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
