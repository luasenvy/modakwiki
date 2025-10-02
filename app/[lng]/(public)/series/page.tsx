import { Info } from "lucide-react";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { SeriesFilter } from "@/components/core/SeriesFilter";
import { SeriesList } from "@/components/core/SeriesList";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export async function generateMetadata(ctx: PageProps<"/[lng]/list">) {
  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  return {
    title: t("Series List"),
    description: t("View or search the series."),
  };
}

const pageSize = 10;
export default async function SeriesListPage(ctx: PageProps<"/[lng]/series">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const searchParams = await ctx.searchParams;
  const page = Number(searchParams.page ?? "1");
  const type = Number(searchParams.type ?? "1");

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("Series List"), href: `${lng}/list` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          <SeriesFilter key={type} lng={lngParam} searchParams={searchParams} />
          <SeriesList lng={lngParam} searchParams={searchParams} pagination={{ page, pageSize }} />
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
