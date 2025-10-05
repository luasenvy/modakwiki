import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
// import { SeriesList } from "@/components/core/list/SeriesList";
import { PageHeadline } from "@/components/core/PageHeadline";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
// import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function SeriesPage(ctx: PageProps<"/[lng]/site/series">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("Site") },
    { title: t("Series"), href: `${lng}/site/series` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="wide" className="space-y-2">
          <PageHeadline
            t={t}
            lng={lngParam}
            prose
            title={t("Series Management")}
            description={t("Manage your series and pages")}
            className="max-w-full"
          />

          {/* <SeriesList lng={lngParam} /> */}
        </Container>
      </Viewport>
    </>
  );
}
