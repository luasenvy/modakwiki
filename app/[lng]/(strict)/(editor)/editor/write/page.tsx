import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import MdxEditor from "@/components/core/MdxEditor";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document, getTablesByDoctype } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WritePage(ctx: PageProps<"/[lng]/editor/write">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);

  const searchParams = await ctx.searchParams;
  const id = searchParams.id as string;

  const doctype = searchParams.type as Doctype;
  const title = searchParams.title as string;

  // 신규 문서 생성
  if (!id) {
    const { t } = await useTranslation(lngParam);

    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: t("editor") },
      { title: t("new document"), href: `${lng}/editor/write` },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <FootnoteHighlighter />
        <MdxEditor key="new" lng={lngParam} title={title} doctype={doctype} />
      </>
    );
  }

  // 기존 문서 편집
  const client = await pool.connect();
  try {
    const session = (await auth.api.getSession({ headers: await headers() }))!;

    const { table } = getTablesByDoctype(doctype);
    if (!table) return notFound();

    const {
      rows: [doc],
    } = await client.query<Document>(
      `SELECT id, title, content, email
         FROM ${table}
        WHERE id = $1
          AND email = $2
          AND deleted IS NULL`,
      [id, session.user.email],
    );

    if (!doc) return notFound();

    const { t } = await useTranslation(lngParam);

    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: t("editor") },
      {
        title: doc.title,
        href: `${lng}/editor/write?${new URLSearchParams({ id, type: doctype })}`,
      },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <MdxEditor
          key={doc.id}
          lng={lngParam}
          doc={doc}
          doctype={doctype}
          deletable={session.user.email === doc.email}
        />
      </>
    );
  } finally {
    client.release();
  }
}
