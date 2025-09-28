import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { isDev } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
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

  const { table, history } = getTablesByDoctype(doctype);

  if (!table) return;

  let doc;
  if (created) {
    doc = await knex
      .select({
        id: "d.id",
        title: "d.title",
        description: "h.description",
        content: "h.content",
        license: "h.license",
        created: "h.created",
        email: "u.email",
        name: "u.name",
        image: "u.image",
        emailVerified: "u.emailVerified",
      })
      .from({ h: history })
      .join({ d: table }, "d.id", "=", "h.docId")
      .join({ u: "user" }, "u.id", "=", "d.userId")
      .whereNull("d.deleted")
      .where({
        "h.docId": id,
        "h.created": created,
      })
      .first();
  } else {
    doc = await knex
      .select({
        title: "d.title",
        description: "d.description",
        license: "d.license",
        created: "d.created",
        updated: "d.updated",
        name: "u.name",
        image: "u.image",
        email: "u.email",
        emailVerified: "u.emailVerified",
      })
      .from({ d: table })
      .join({ u: "user" }, "u.id", "=", "d.userId")
      .whereNull("d.deleted")
      .where({ "d.id": id });
  }

  return doc;
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

  const { table, history } = getTablesByDoctype(doctype);
  if (!table) return notFound();

  let doc: DocumentType & User;
  if (created) {
    doc = await knex
      .select({
        id: "d.id",
        title: "d.title",
        category: "h.category",
        tags: "h.tags",
        description: "h.description",
        content: "h.content",
        license: "h.license",
        created: "h.created",
        email: "u.email",
        name: "u.name",
        image: "u.image",
        emailVerified: "u.emailVerified",
      })
      .from({ h: history })
      .join({ d: table }, "d.id", "=", "h.docId")
      .join({ u: "user" }, "u.id", "=", "h.userId")
      .whereNull("d.deleted")
      .where({
        "h.docId": id,
        "h.created": created,
      })
      .first();
  } else {
    if (isDev) {
      doc = await knex
        .select({
          id: "d.id",
          title: "d.title",
          description: "d.description",
          content: "d.content",
          license: "d.license",
          category: "d.category",
          tags: "d.tags",
          created: "d.created",
          updated: "d.updated",
          userId: "d.userId",
          email: "u.email",
          name: "u.name",
          image: "u.image",
          emailVerified: "u.emailVerified",
        })
        .from({ d: table })
        .join({ u: "user" }, "u.id", "=", "d.userId")
        .whereNull("d.deleted")
        .where({ "d.id": id })
        .first();
    } else {
      doc = await knex
        .with(
          "d",
          knex
            .update({ view: knex.raw(`"t"."view" + 1`) })
            .from({ t: table })
            .whereNull("t.deleted")
            .where({ "t.id": id })
            .returning([
              "t.id",
              "t.title",
              "t.description",
              "t.content",
              "t.license",
              "t.category",
              "t.tags",
              "t.userId",
              "t.created",
              "t.updated",
            ]),
        )
        .select({
          id: "d.id",
          title: "d.title",
          description: "d.description",
          content: "d.content",
          license: "d.license",
          category: "d.category",
          tags: "d.tags",
          email: "u.email",
          name: "u.name",
          image: "u.image",
          emailVerified: "u.emailVerified",
          userId: "d.userId",
          created: "d.created",
          updated: "d.updated",
        })
        .from("d")
        .join({ u: "user" }, "u.id", "=", "d.userId")
        .first();
    }
  }

  if (!doc) {
    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: doctypeEnum.document === doctype ? t("wiki document") : t("post") },
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
        <FootnoteHighlighter />
        <Document lng={lngParam} content={content.trim()} />
      </>
    );
  }

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: doctypeEnum.document === doctype ? t("wiki document") : t("post") },
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
}
