import { Info } from "lucide-react";
import { headers } from "next/headers";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentFilter } from "@/components/core/DocumentFilter";
import { DocumentList } from "@/components/core/DocumentList";
import { Pagination } from "@/components/core/Pagination";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

const pageSize = 10;
const columns = {
  id: "d.id",
  title: "d.title",
  preview: "d.preview",
  created: "d.created",
  name: "u.name",
  image: "u.image",
  email: "u.email",
  emailVerified: "u.emailVerified",
};

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const searchParams = await ctx.searchParams;

  const lng = localePrefix(lngParam);

  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  let tags = searchParams.tags || [];

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const counting = knex
    .count({ count: "*" })
    .from({ d: "document" })
    .whereNull("d.deleted")
    .andWhere("d.userId", session.user.id);
  if (search) {
    counting.andWhere((q) => {
      q.where("d.title", "ILIKE", `%${search}%`)
        .orWhere("d.description", "ILIKE", `%${search}%`)
        .orWhere("d.content", "ILIKE", `%${search}%`);
    });
  }
  if (category) counting.andWhere("d.category", category);
  if (tags.length) counting.andWhere("d.tags", "&&", tags);

  const selecting = counting
    .clone()
    .clearSelect()
    .select({ ...columns, type: knex.raw(`'${doctypeEnum.document}'`) })
    .from({ d: "document" })
    .join({ u: "user" }, "u.id", "=", "d.userId");

  const [{ count: docCount }, { count: postCount }] = await knex.unionAll([
    counting,
    counting.clone().from({ d: "post" }),
  ]);

  const rows = await knex
    .select<Array<DocumentType & User & { type?: Doctype }>>("*")
    .from(
      knex
        .unionAll([
          selecting,
          selecting
            .clone()
            .clearSelect()
            .select({
              ...columns,
              type: knex.raw(`'${doctypeEnum.post}'`),
            })
            .from({ d: "post" }),
        ])
        .as("o"),
    )
    .orderBy("o.created", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  const { t } = await useTranslation(lngParam);
  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("me"), href: `${lng}/me` },
    { title: t("documents"), href: `${lng}/me/documents` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          <DocumentFilter lng={lngParam} searchParams={searchParams} />
          <DocumentList lng={lngParam} rows={rows} showDoctype />
          <Pagination
            className="mt-6 sm:col-span-2 lg:col-span-3"
            page={page}
            pageSize={pageSize}
            total={Number(docCount) + Number(postCount)}
            searchParams={searchParams}
          />
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">{t("search results")}</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
            {t("total {{docCount}} documents and {{postCount}} posts", { docCount, postCount })}
          </div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
