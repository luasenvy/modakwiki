import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import MdxEditor from "@/components/core/MdxEditor";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, getTablesByDoctype } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WritePage(ctx: PageProps<"/[lng]/editor/write">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);

  const searchParams = await ctx.searchParams;
  const id = searchParams.id as string;

  const doctype = searchParams.type as Doctype;
  const title = searchParams.title as string;
  const category = searchParams.category as string;
  const tags = Array.isArray(searchParams.tags)
    ? searchParams.tags
    : [searchParams.tags as string].flat().filter(Boolean);

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
        <MdxEditor
          key="new"
          lng={lngParam}
          title={title}
          doctype={doctype}
          category={category}
          tags={tags}
        />
      </>
    );
  }

  // 기존 문서 편집

  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const { table } = getTablesByDoctype(doctype);
  if (!table) return notFound();

  const doc = await knex
    .select({
      id: "d.id",
      title: "d.title",
      description: "d.description",
      content: "d.content",
      license: "d.license",
      created: "d.created",
      updated: "d.updated",
      userId: "d.userId",
      category: "d.category",
      tags: "d.tags",
    })
    .from({ d: table })
    .join({ u: "user" }, "u.id", "=", "d.userId")
    .whereNull("d.deleted")
    .andWhere("d.id", id)
    .andWhere("d.userId", session.user.id)
    .first();

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
        deletable={session.user.id === doc.userId}
      />
    </>
  );
}
