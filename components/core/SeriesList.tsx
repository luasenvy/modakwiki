import { SearchParams } from "next/dist/server/request/search-params";
import Link from "next/link";
import { Pagination } from "@/components/core/Pagination";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, doctypeEnum, getTablesByDoctype } from "@/lib/schema/document";
import { Series } from "@/lib/schema/series";
import { localePrefix } from "@/lib/url";

interface SeriesListProps {
  lng: Language;
  searchParams: SearchParams;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export async function SeriesList({
  lng: lngParam,
  pagination = {},
  searchParams,
}: SeriesListProps) {
  const lng = localePrefix(lngParam);
  const datetimeFormat = new Intl.DateTimeFormat(lngParam);

  const search = searchParams.search || "";
  const type = (searchParams.type || doctypeEnum.document) as Doctype;

  if (!pagination.page) pagination.page = 1;
  if (!pagination.pageSize) pagination.pageSize = 10;

  const { series } = getTablesByDoctype(type);
  const counting = knex.count({ count: "*" }).from({ s: series! }).whereNull("s.deleted");

  if (search) {
    counting.andWhere((q) => {
      q.where("s.title", "ILIKE", `%${search}%`)
        .orWhere("s.description", "ILIKE", `%${search}%`)
        .orWhere("s.content", "ILIKE", `%${search}%`);
    });
  }

  const selecting = counting
    .clone()
    .clearSelect()
    .select({
      id: `s.id`,
      title: `s.title`,
      description: `s.description`,
      cover: `s.cover`,
      created: `s.created`,
    })
    .orderBy(`s.created`, "desc")
    .offset((pagination.page - 1) * pagination.pageSize)
    .limit(pagination.pageSize);

  const [{ count }] = await counting;
  const rows: Array<Series> = await selecting;

  const { t } = await useTranslation(lngParam);

  return rows.length > 0 ? (
    <>
      {rows.map(({ id, title, description, cover, created }) => {
        return (
          <div className="p-2 hover:bg-accent/40" key={id}>
            <div className="flex gap-2">
              {cover && (
                <div
                  role="img"
                  className="size-24 rounded bg-center bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: `url('/api/image${cover}')`,
                  }}
                />
              )}

              <div className="prose dark:prose-invert flex max-w-none grow flex-col">
                <h2 className="!mt-0 !mb-0.5 font-semibold text-xl">
                  <Link
                    key={id}
                    href={`${lng}/series/pages?${new URLSearchParams({ id, type })}`}
                    className="text-blue-600 no-underline hover:underline dark:text-blue-500"
                  >
                    {title}
                  </Link>
                </h2>

                <p className="!my-0.5 text-muted-foreground text-sm">{description}</p>

                <p className="!mt-auto text-right text-xs">
                  {datetimeFormat.format(Number(created))}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <Pagination
        className="mt-6 sm:col-span-2 lg:col-span-3"
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={Number(count)}
        searchParams={searchParams}
      />
    </>
  ) : (
    <div className="p-4 text-center text-muted-foreground text-sm">{t("No results found.")}</div>
  );
}
