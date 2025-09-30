import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { UserInfo } from "@/components/core/UserInfo";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { User } from "@/lib/schema/user";

export async function generateMetadata(ctx: PageProps<"/[lng]/profile/[email]">) {
  const email = decodeURIComponent((await ctx.params).email);

  return await knex
    .select({
      title: "name",
      description: knex.raw(`'Profile of ' || name`),
    })
    .from("user")
    .where({ email })
    .first();
}

export default async function UserProfilePage(ctx: PageProps<"/[lng]/profile/[email]">) {
  const params = await ctx.params;
  const lngParam = params.lng as Language;
  const email = decodeURIComponent(params.email);

  const user = await knex
    .select({
      id: "id",
      name: "name",
      image: "image",
      bio: "bio",
      createdAt: "createdAt",
      email: knex.raw(`'${email}'`),
      emailVerified: "emailVerified",
    })
    .from("user")
    .where({ email })
    .first();

  if (!user) return notFound();

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("User Info") }, { title: user.name }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <UserInfo lng={lngParam} user={user as User} />
    </>
  );
}
