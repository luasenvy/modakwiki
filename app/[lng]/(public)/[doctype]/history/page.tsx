import { MoveRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { PageHeadline } from "@/components/core/PageHeadline";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
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

export default async function HistoryPage(ctx: PageProps<"/[lng]/[doctype]/history">) {
  const params = await ctx.params;
  const lngParam = params.lng as Language;
  const doctype = params.doctype as Doctype;

  const lng = localePrefix(lngParam);

  const id = (await ctx.searchParams).id as string;

  const { table, history } = getTablesByDoctype(doctype);
  if (!table) return notFound();

  const doc = await knex.select("title").from(table).where({ id, deleted: null }).first();

  if (!doc) return notFound();

  const rows = await knex
    .select({
      added: "h.added",
      email: "u.email",
      description: "h.description",
      category: "h.category",
      tags: "h.tags",
      license: "h.license",
      name: "u.name",
      removed: "h.removed",
      created: "h.created",
    })
    .from({ h: history })
    .join({ u: "user" }, "u.id", "=", "h.userId")
    .where("h.docId", id)
    .orderBy("h.created", "desc");

  const dateFormater = new Intl.DateTimeFormat(lngParam);
  const numberFormat = new Intl.NumberFormat(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: doctypeEnum.document === doctype ? t("document") : t("post") },
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
          <PageHeadline t={t} title={`${t("change history")}: ${doc.title}`} />

          <div className="mt-6">
            {rows.map(
              (
                { description, added, removed, name, category, tags, created, email, license },
                i,
              ) => {
                const isChanged = added + removed > 0;
                const prev = rows[i + 1];

                let isDescriptionChange = false;
                let isCategoryChange = false;
                let isTagsChange = false;
                let isLicenseChange = false;

                if (prev) {
                  isDescriptionChange = description !== prev.description;
                  isCategoryChange = category !== prev.category;
                  isTagsChange = tags?.join("") !== prev.tags?.join("");
                  isLicenseChange = license !== prev.license;
                }

                const isMetadataChange =
                  isDescriptionChange || isCategoryChange || isTagsChange || isLicenseChange;

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
                          className="text-blue-600 no-underline hover:underline"
                        >
                          {isChanged ? (
                            <>
                              {t("Text changed")} |{" "}
                              <span className="text-green-600">+{numberFormat.format(added)}</span>{" "}
                              |{" "}
                              <span className="text-red-600">-{numberFormat.format(removed)}</span>
                            </>
                          ) : isMetadataChange ? (
                            t("Information Changed")
                          ) : (
                            t("Created")
                          )}
                        </Link>
                      </p>

                      {isMetadataChange && (
                        <div className="mt-1 space-y-2 lg:space-y-1">
                          {isLicenseChange && (
                            <div className="flex justify-start space-x-2 max-lg:flex-col lg:items-center">
                              <p className="!my-0 text-muted-foreground text-xs">{t("license")}:</p>
                              <p className="!my-0 text-rose-600 text-xs">
                                "{t(prev.license as string)}"
                              </p>
                              <MoveRight className="size-4 max-lg:hidden" />
                              <p className="!my-0 text-green-600 text-xs">
                                "{t(license as string)}"
                              </p>
                            </div>
                          )}
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
                          className="text-blue-600 no-underline hover:underline"
                        >
                          {name}
                        </a>
                      </p>
                      <p className="!my-0 text-xs md:text-sm">
                        {dateFormater.format(Number(created))}
                      </p>
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
}
