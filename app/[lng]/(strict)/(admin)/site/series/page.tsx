import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
// import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function SeriesPage(ctx: PageProps<"/[lng]/site/series">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "사이트관리" },
    { title: "시리즈관리", href: `${lng}/site/series` },
  ];

  // const { t } = await useTranslation(lngParam);
  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="wide" className="space-y-2"></Container>
      </Viewport>
    </>
  );
}
