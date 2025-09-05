import { headers } from "next/headers";
import { forbidden, notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { auth } from "@/lib/auth/server";
import type { Language } from "@/lib/i18n/config";
import { scopeEnum } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return notFound();
  if (session.user.scope < scopeEnum.admin) return forbidden();

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
