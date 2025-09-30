import { forbidden } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { isDev } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/privacy">) {
  if (!isDev) return forbidden();

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);
  const { t } = await useTranslation(lngParam);

  const content = `
## 개요

모닥위키 서비스 약관

`.trim();

  const title = t("Terms of Service");
  const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/terms` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <FootnoteHighlighter />
      <Document lng={lngParam} title={title} content={content.trim()} />
    </>
  );
}
