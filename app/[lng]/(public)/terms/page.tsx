import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/privacy">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);
  const { t } = await useTranslation(lngParam);

  const content = `
## 서비스 약관

`.trim();

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("Terms of Service"), href: `${lng}/terms` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} content={content.trim()} />
    </>
  );
}
