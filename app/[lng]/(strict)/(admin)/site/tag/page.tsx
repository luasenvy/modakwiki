import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { CategoryList } from "@/components/core/list/CategoryList";
import { PageHeadline } from "@/components/core/PageHeadline";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "사이트관리" },
    { title: "태그관리", href: `${lng}/site/tags` },
  ];

  const rows = await knex
    .select({
      id: "c.id",
      description: "c.description",
      created: "c.created",
    })
    .from({ c: "category" })
    .orderBy("c.id", "asc");

  const { t } = await useTranslation(lngParam);
  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="wide" className="space-y-2">
          <PageHeadline
            t={t}
            prose
            title={t("Tag Management")}
            description={t("Manage your tags and categories")}
          />

          <CategoryList rows={rows} />
        </Container>
      </Viewport>
    </>
  );
}
