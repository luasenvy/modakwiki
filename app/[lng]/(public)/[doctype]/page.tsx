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
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export async function generateMetadata(ctx: PageProps<"/[lng]/[doctype]">) {
  const params = await ctx.params;
  const searchParams = await ctx.searchParams;

  const doctype = params.doctype as Doctype;

  const id = searchParams.id;
  const created = searchParams.created;

  const client = await pool.connect();
  try {
    const { table, history } = getTablesByDoctype(doctype);

    if (!table) return;

    let doc;
    if (created) {
      const {
        rows: [_doc],
      } = await client.query<DocumentType & User>(
        `SELECT d.id
              , d.title
              , h.description
              , h.content
              , h.license
              , u.email
              , u.name
              , u.image
              , u."emailVerified"
         FROM ${history} h
         JOIN ${table} d 
           ON d.id = h."docId"
         JOIN "user" u
           ON d."userId" = u.id
        WHERE h."docId" = $1
          AND h.created = $2
          AND d.deleted IS NULL`,
        [id, created],
      );
      doc = _doc;
    } else {
      const {
        rows: [_doc],
      } = await client.query<DocumentType & User>(
        `SELECT d.title, d.description, d.license, u.name, u.image, u.email, u."emailVerified"
           FROM ${table} d
           JOIN "user" u
             ON u.id = d."userId"
          WHERE d.id = $1
            AND d.deleted IS NULL`,
        [id],
      );
      doc = _doc;
    }

    return doc;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

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

    let doc: DocumentType & User;
    if (created) {
      const {
        rows: [_doc],
      } = await client.query<DocumentType & User>(
        `SELECT d.id
              , d.title
              , h."userId"
              , h.category
              , h.tags
              , h.description
              , h.content
              , h.license
              , u.email
              , u.name
              , u.image
              , u."emailVerified"
         FROM ${history} h
         JOIN ${table} d
           ON d.id = h."docId"
         JOIN "user" u
           ON h."userId" = u.id
        WHERE h."docId" = $1
          AND h.created = $2
          AND d.deleted IS NULL`,
        [id, created],
      );
      doc = _doc;
    } else {
      let sql = ``;
      // 개발모드에서는 조회수 증가 쿼리를 실행하지 않음
      if (isDev) {
        sql = `SELECT d.id, d.title, d.description, d.content, d.license, d.category, d.tags, u."emailVerified", u.image, u.name, u.email, d."userId"
                 FROM ${table} d
                JOIN "user" u
                  ON u.id = d."userId"
               WHERE d.id = $1
                 AND d.deleted IS NULL`;
      } else {
        sql = `WITH d AS (
                              UPDATE ${table} t
                                 SET t.view = t.view + 1
                               WHERE t.id = $1
                                 AND t.deleted IS NULL
                           RETURNING t.id, t.title, t.description, t.content, t.license, t.category, t.tags, t."userId"
                         )
               SELECT d.id, d.title, d.description, d.content, d.license, d.category, d.tags, u.email, u.name, u.image, u."emailVerified", d."userId"
                 FROM d
                 JOIN "user" u
                   ON u.id = d."userId"`;
      }

      const {
        rows: [_doc],
      } = await client.query<DocumentType & User>(sql, [id]);
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

가장 먼저 ${t(doctype)}를 [등록](${lng}/editor/write?title=${encodeURIComponent(guessTitle)}&type=${doctype})해보세요!`;
      return (
        <>
          <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
          <Document lng={lngParam} content={content.trim()} />
        </>
      );
    }

    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: doctypeEnum.document === doctype ? t("wiki document") : t("wiki essay") },
      { title: doc.title, href: `${lng}/${doctype}/${doc.id}` },
    ];

    const session = await auth.api.getSession({ headers: await headers() });
    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <FootnoteHighlighter />
        <Document lng={lngParam} doc={doc} doctype={doctype} session={session?.user} />
      </>
    );
  } finally {
    client.release();
  }
}
