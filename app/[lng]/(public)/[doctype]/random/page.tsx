import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { isDev } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, getTablesByDoctype } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]/random">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);
  const doctype = params.doctype as Doctype;

  const { table } = getTablesByDoctype(doctype);
  if (!table) return notFound();

  const doc = await knex
    .select("id")
    .from(knex.raw(`?? TABLESAMPLE SYSTEM (100)`, table))
    .limit(1)
    .first();

  if (!doc) {
    const { t } = await useTranslation(lngParam);
    const content = isDev
      ? `[${t("Please register the first document!")}](${lng}/editor/write)`
      : "";

    const title = t("There is no any document.");
    const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/w/random` }];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Document lng={lngParam} title={title} content={content.trim()} />
      </>
    );
  }

  return redirect(`${lng}/${doctype}?${new URLSearchParams({ id: doc.id })}`);
}
