import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { isDev } from "@/config";
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
              , d.description
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
      let sql = ``;
      // 개발모드에서는 조회수 증가 쿼리를 실행하지 않음
      if (isDev) {
        sql = `SELECT id, title, description, content, email
                 FROM ${table}
                WHERE id = $1
                  AND deleted IS NULL`;
      } else {
        sql = `UPDATE ${table}
                  SET view = view + 1
                WHERE id = $1
                  AND deleted IS NULL
            RETURNING id, title, description, content, email`;
      }

      const {
        rows: [_doc],
      } = await client.query<DocumentType>(sql, [id]);
      doc = _doc;
    }

    if (!doc) {
      const breadcrumbs: Array<BreadcrumbItem> = [
        { title: doctypeEnum.document === doctype ? t("wiki document") : t("wiki essay") },
        { title: t("Not Found"), href: `${lng}/${doctype}/${id}` },
      ];

      const guessTitle = (id as string).replaceAll("-", " ");
      const content = `
## 문서를 찾지 못했습니다.

"${guessTitle}" 제목으로 등록된 ${t(doctype)}가 없습니다.

가장 먼저 ${t(doctype)}를 [등록](${lng}/editor/write?title=${encodeURIComponent(guessTitle)}&type=${doctype})해보세요!
      `;
      return (
        <>
          <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
          <Document lng={lngParam} content={content.trim()} />
        </>
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: doctypeEnum.document === doctype ? t("wiki document") : t("wiki essay") },
      { title: doc.title, href: `${lng}/${doctype}/${doc.id}` },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <FootnoteHighlighter />
        <Document lng={lngParam} doc={doc} doctype={doctype} session={session} />
      </>
    );
  } finally {
    client.release();
  }
}
