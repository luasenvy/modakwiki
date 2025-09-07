import { ArrowRight, MoveRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import {
  Doctype,
  Document as DocumentType,
  doctypeEnum,
  getTablesByDoctype,
} from "@/lib/schema/document";
import { History as DocumentHistory } from "@/lib/schema/history";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export default async function HistoryPage(ctx: PageProps<"/[lng]/[doctype]/history">) {
  const params = await ctx.params;
  const lngParam = params.lng as Language;
  const doctype = params.doctype as Doctype;

  const lng = localePrefix(lngParam);

  const id = (await ctx.searchParams).id as string;

  const client = await pool.connect();
  try {
    const { table, history } = getTablesByDoctype(doctype);
    if (!table) return notFound();

    const {
      rows: [doc],
    } = await client.query<DocumentType>(
      `SELECT title
         FROM ${table}
        WHERE id = $1
          AND deleted IS NULL`,
      [id],
    );

    if (!doc) return notFound();

    const { rows } = await client.query<DocumentHistory & { name: string }>(
      `SELECT h.added
            , h.email
            , h.description
            , h.category
            , h.tags
            , u.name
            , h.removed
            , h.created
         FROM ${history} h
         JOIN "user" u ON u.email = h.email
        WHERE h.id = $1
     ORDER BY h.created DESC`,
      [id],
    );

    const dateFormater = new Intl.DateTimeFormat(lngParam);
    const numberFormat = new Intl.NumberFormat(lngParam);

    const { t } = await useTranslation(lngParam);

    const breadcrumbs: Array<BreadcrumbItem> = [
      { title: doctypeEnum.document === doctype ? t("wiki document") : t("wiki essay") },
      { title: t("change history") },
      {
        title: doc.title,
        href: `${lng}/${doctype}/history?${new URLSearchParams({ id })}`,
      },
    ];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />

        <Viewport className="!justify-start flex-col items-center">
          <Container variant="wide" className="prose dark:prose-invert">
            <h2>
              {t("change history")}: {doc.title}
            </h2>

            <div>
              {rows.map(
                ({ description, added, removed, name, email, category, tags, created }, i) => {
                  const isChanged = added + removed > 0;
                  const prev = rows[i + 1];

                  let isDescriptionChange = false;
                  let isCategoryChange = false;
                  let isTagsChange = false;

                  if (prev) {
                    isDescriptionChange = description !== prev.description;
                    isCategoryChange = category !== prev.category;
                    isTagsChange = tags?.join("") !== prev.tags?.join("");
                  }

                  const isMetadataChange = isDescriptionChange || isCategoryChange || isTagsChange;

                  return (
                    <div
                      key={`history-${i}`}
                      className="not-first:mt-8 flex py-2 hover:bg-accent/80 max-sm:flex-col sm:items-center"
                    >
                      <div>
                        <p className="!my-0 font-semibold">
                          <Link
                            href={
                              isChanged
                                ? `${lng}/${doctype}/diff?${new URLSearchParams({ id, created: String(created) })}`
                                : `${lng}/${doctype}?${new URLSearchParams({ id, created: String(created) })}`
                            }
                            className="text-blue-500 no-underline hover:underline"
                          >
                            {isChanged ? (
                              <>
                                변경점 |{" "}
                                <span className="text-green-600">
                                  +{numberFormat.format(added)}
                                </span>{" "}
                                |{" "}
                                <span className="text-red-600">
                                  -{numberFormat.format(removed)}
                                </span>
                              </>
                            ) : isDescriptionChange ? (
                              t("Information Changed")
                            ) : (
                              t("Created")
                            )}
                          </Link>
                        </p>

                        {isMetadataChange && (
                          <div className="mt-1 space-y-2 lg:space-y-1">
                            {isDescriptionChange && (
                              <div className="flex justify-start space-x-2 max-lg:flex-col lg:items-center">
                                <p className="!my-0 text-muted-foreground text-xs">
                                  {t("description")}:
                                </p>
                                <p className="!my-0 text-rose-600 text-xs">"{prev.description}"</p>
                                <MoveRight className="size-4 max-lg:hidden" />
                                <p className="!my-0 text-green-600 text-xs">"{description}"</p>
                              </div>
                            )}
                            {isCategoryChange && (
                              <div className="flex justify-start space-x-2 max-lg:flex-col lg:items-center">
                                <p className="!my-0 text-muted-foreground text-xs">
                                  {t("category")}:
                                </p>
                                <p className="!my-0 text-rose-600 text-xs">"{prev.category}"</p>
                                <MoveRight className="size-4 max-lg:hidden" />
                                <p className="!my-0 text-green-600 text-xs">"{category}"</p>
                              </div>
                            )}
                            {isTagsChange && (
                              <div className="flex justify-start space-x-2 max-lg:flex-col lg:items-center">
                                <p className="!my-0 text-muted-foreground text-xs">{t("tag")}:</p>
                                <p className="!my-0 text-rose-600 text-xs">
                                  "{prev.tags?.join(", ")}"
                                </p>
                                <MoveRight className="size-4 max-lg:hidden" />
                                <p className="!my-0 text-green-600 text-xs">"{tags?.join(", ")}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ml-auto flex gap-1 max-sm:flex-col sm:items-center">
                        <p className="!my-0 text-xs md:text-sm">
                          <a
                            href={`mailto:${email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 no-underline hover:underline"
                          >
                            {name}
                          </a>
                        </p>
                        <p className="!my-0 text-xs md:text-sm">{dateFormater.format(created)}</p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Container>
        </Viewport>
      </>
    );
  } finally {
    client.release();
  }
}
