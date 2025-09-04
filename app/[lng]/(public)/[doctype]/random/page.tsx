import { notFound, redirect } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { isDev } from "@/config";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, getTablesByDoctype } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]/random">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);
  const doctype = params.doctype as Doctype;

  const client = await pool.connect();
  try {
    const { table } = getTablesByDoctype(doctype);
    if (!table) return notFound();

    const {
      rows: [doc],
    } = await client.query<DocumentType>(
      `SELECT id, title, content, email
         FROM ${table}
  TABLESAMPLE SYSTEM (100)
        LIMIT 1`,
    );

    if (!doc) {
      const { t } = await useTranslation(lngParam);
      const content = `
## ${t("No documents found")}

${isDev && `[${t("Please register the first document!")}](${lng}/signin)`}
      `;

      const breadcrumbs: Array<BreadcrumbItem> = [
        { title: "문서함이 비어있습니다", href: `${lng}/w/random` },
      ];

      return (
        <>
          <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
          <Document lng={lngParam} content={content.trim()} />
        </>
      );
    }

    return redirect(`${lng}/${doctype}?${new URLSearchParams({ id: doc.id })}`);
  } finally {
    client.release();
  }
}
