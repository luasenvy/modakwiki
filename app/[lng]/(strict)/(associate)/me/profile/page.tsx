import { headers } from "next/headers";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { UserInfo } from "@/components/core/UserInfo";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { User } from "@/lib/schema/user";

export default async function ProfilePage(ctx: PageProps<"/[lng]/me/profile">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("User Info") },
    { title: session.user.name },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <UserInfo lng={lngParam} user={session.user as User} />
    </>
  );
}
