import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import MdxEditor from "@/components/core/MdxEditor";

import { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function WritePage(ctx: PageProps<"/[lng]/editor/write">) {
  const lngParam = (await ctx.params).lng as Language;

  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "편집자" },
    { title: "새 문서", href: `${lng}/editor/write` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <MdxEditor lng={lngParam} />
    </>
  );
}
