import { Info } from "lucide-react";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentFilter } from "@/components/core/DocumentFilter";
import { DocumentList } from "@/components/core/DocumentList";
import { Pagination } from "@/components/core/Pagination";
import { site } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { doctypeEnum } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

const pageSize = 10;
export default async function SearchPage(ctx: PageProps<"/[lng]/search">) {
  const lngParam = (await ctx.params).lng as Language;
  const searchParams = await ctx.searchParams;

  const lng = localePrefix(lngParam);

  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  let tags = searchParams.tags || [];

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const counting = knex.count({ count: "*" }).from({ d: "document" }).whereNull("d.deleted");

  const selecting = knex
    .select({
      id: "d.id",
      title: "d.title",
      preview: "d.preview",
      type: "d.type",
      created: "d.created",
      updated: "d.updated",
      name: "u.name",
      image: "u.image",
      email: "u.email",
      emailVerified: "u.emailVerified",
    })
    .from({ d: "document" })
    .join({ u: "user" }, "d.userId", "=", "u.id")
    .whereNull("d.deleted")
    .orderBy("d.created", "desc");

  if (search) {
    counting.andWhere((q) => {
      q.where("d.title", "ILIKE", `%${search}%`)
        .orWhere("d.description", "ILIKE", `%${search}%`)
        .orWhere("d.content", "ILIKE", `%${search}%`);
    });
    selecting.andWhere((q) => {
      q.where("d.title", "ILIKE", `%${search}%`)
        .orWhere("d.description", "ILIKE", `%${search}%`)
        .orWhere("d.content", "ILIKE", `%${search}%`);
    });
  }
  if (category) {
    counting.andWhere("d.category", category);
    selecting.andWhere("d.category", category);
  }
  if (tags.length) {
    counting.andWhere("d.tags", "&&", tags);
    selecting.andWhere("d.tags", "&&", tags);
  }

  const [{ count: docCount }, { count: essayCount }] = await knex.unionAll([
    counting,
    counting.clone().from({ d: "essay" }),
  ]);

  const rows = await knex
    .unionAll([selecting, selecting.clone().from({ d: "essay" })])
    .orderBy("created", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  const { t } = await useTranslation(lngParam);
  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t(site.name) },
    { title: t("search"), href: `${lng}/search` },
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
