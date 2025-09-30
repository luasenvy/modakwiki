import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { PageHeadline } from "@/components/core/PageHeadline";
import { UserTable } from "@/components/core/table/UserTable";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export default async function UserPage(ctx: PageProps<"/[lng]/me/documents">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "사이트관리" },
    { title: "사용자관리", href: `${lng}/site/user` },
  ];

  const rows = await knex
    .select<User[]>({
      id: "u.id",
      name: "u.name",
      email: "u.email",
      scope: "u.scope",
      emailVerified: "u.emailVerified",
      createdAt: "u.createdAt",
    })
    .from({ u: "user" })
    .orderBy("u.createdAt", "desc");

  const { t } = await useTranslation(lngParam);
  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="wide" className="space-y-2">
          <PageHeadline
            t={t}
            prose
            title={t("User Management")}
            description={t("Manage users in this site")}
          />

          <UserTable lng={lngParam} rows={rows} />
        </Container>
      </Viewport>
    </>
  );
}
