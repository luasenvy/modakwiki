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
export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const session = (await auth.api.getSession({ headers: await headers() }))!;

  const lngParam = (await ctx.params).lng as Language;
  const searchParams = await ctx.searchParams;

  const lng = localePrefix(lngParam);

  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const tags = searchParams.tags || [];

  const counting = knex
    .count({ count: "*" })
    .from({ d: "document" })
    .whereNull("d.deleted")
    .andWhere("d.userId", session.user.id);

  const selecting = knex
    .select({
      id: "d.id",
      title: "d.title",
      preview: "d.preview",
      created: "d.created",
      type: knex.raw(`'${doctypeEnum.document}'`),
      name: "u.name",
      image: "u.image",
      email: "u.email",
      emailVerified: "u.emailVerified",
    })
    .from({ d: "document" })
    .join({ u: "user" }, "u.id", "=", "d.userId")
    .whereNull("d.deleted")
    .andWhere("d.userId", session.user.id);

  if (search) {
    counting.andWhere((q) => {
      q.where("e.title", "ILIKE", `%${search}%`)
        .orWhere("e.description", "ILIKE", `%${search}%`)
        .orWhere("e.content", "ILIKE", `%${search}%`);
    });
    selecting.andWhere((q) => {
      q.where("e.title", "ILIKE", `%${search}%`)
        .orWhere("e.description", "ILIKE", `%${search}%`)
        .orWhere("e.content", "ILIKE", `%${search}%`);
    });
  }

  if (category) {
    counting.andWhere("e.category", category);
    selecting.andWhere("e.category", category);
  }
  if (tags.length) {
    counting.andWhere("e.tags", "&&", tags);
    selecting.andWhere("e.tags", "&&", tags);
  }

  const [{ count: docCount }, { count: essayCount }] = await knex.unionAll([
    counting,
    counting.clone().from({ d: "essay" }),
  ]);

  const rows = await knex
    .select<Array<DocumentType & User & { type?: Doctype }>>({
      id: "o.id",
      title: "o.title",
      preview: "o.preview",
      created: "o.created",
      type: "o.type",
      name: "o.name",
      image: "o.image",
      email: "o.email",
      emailVerified: "o.emailVerified",
    })
    .from(
      knex
        .unionAll([
          selecting,
          selecting
            .clone()
            .clearSelect()
            .select({
              id: "d.id",
              title: "d.title",
              preview: "d.preview",
              created: "d.created",
              type: knex.raw(`'${doctypeEnum.essay}'`),
              name: "u.name",
              image: "u.image",
              email: "u.email",
              emailVerified: "u.emailVerified",
            })
            .from({ d: "essay" }),
        ])
        .as("o"),
    )
    .orderBy("o.created", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "내 정보", href: `${lng}/me` },
    { title: "문서함", href: `${lng}/me/documents` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          {rows.length > 0 ? (
            <>
              <DocumentFilter lng={lngParam} searchParams={searchParams} />
              <DocumentList lng={lngParam} rows={rows} doctype={doctypeEnum.essay} />
              <Pagination
                className="mt-6 sm:col-span-2 lg:col-span-3"
                page={page}
                pageSize={pageSize}
                total={Number(docCount) + Number(essayCount)}
                searchParams={searchParams}
              />
            </>
          ) : (
            t("No results found.")
          )}
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">검색결과</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
            총 {docCount}개의 문서와 {essayCount}개의 에세이가 있습니다.
          </div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
