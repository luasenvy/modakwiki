import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import type { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "파일" },
    { title: "이미지", href: `${lng}/editor/syntax` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
    </>
  );
}
