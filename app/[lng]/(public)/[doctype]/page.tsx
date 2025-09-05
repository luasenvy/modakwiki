import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import {
  Doctype,
  Document as DocumentType,
  doctypeEnum,
  getTablesByDoctype,
} from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]">) {
  const params = await ctx.params;
  const searchParams = await ctx.searchParams;

  const lngParam = params.lng as Language;
  const { t } = await useTranslation(lngParam);
  const lng = localePrefix(lngParam);
  const doctype = params.doctype as Doctype;

  const id = searchParams.id;
  const created = searchParams.created;

  if (!id) return notFound();

  const client = await pool.connect();
  try {
    const { table, history } = getTablesByDoctype(doctype);
    if (!table) return notFound();

    let doc;
    if (created) {
      const {
        rows: [_doc],
      } = await client.query<DocumentType>(
        `SELECT d.id
              , d.title
              , h.content
              , h.email
         FROM ${history} h
         JOIN ${table} d
           ON d.id = h.id
        WHERE h.id = $1
          AND h.created = $2
          AND d.deleted IS NULL`,
        [id, created],
      );
      doc = _doc;
    } else {
      const {
        rows: [_doc],
      } = await client.query<DocumentType>(
        `UPDATE ${table}
            SET view = view + 1
          WHERE id = $1
            AND deleted IS NULL
    RETURNING id, title, content, email`,
        [id],
      );
      doc = _doc;
    }

    if (!doc) return notFound();

    const session = await auth.api.getSession({ headers: await headers() });
    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: doctypeEnum.document === doctype ? t("wiki document") : t("wiki essay") },
      { title: doc.title, href: `${lng}/${doctype}/${doc.id}` },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Document lng={lngParam} doc={doc} doctype={doctype} session={session} />
      </>
    );
  } finally {
    client.release();
  }
}
