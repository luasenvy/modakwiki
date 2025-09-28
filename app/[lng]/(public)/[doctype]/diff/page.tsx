import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { DiffViewer } from "@/components/core/DiffViewer";
import { PageHeadline } from "@/components/core/PageHeadline";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, getTablesByDoctype } from "@/lib/schema/document";
import { History as DocumentHistory } from "@/lib/schema/history";
import { localePrefix } from "@/lib/url";

export default async function DiffPage(ctx: PageProps<"/[lng]/[doctype]/diff">) {
  const params = await ctx.params;
  const doctype = params.doctype as Doctype;

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  // const lng = localePrefix(lngParam);

  const searchParams = await ctx.searchParams;

  const id = searchParams.id as string;
  const created = Number(searchParams.created as string);

  const { table, history } = getTablesByDoctype(doctype);
  if (!table) return notFound();

  const { title } = await knex.select("title").from(table).where({ id, deleted: null }).first();

  if (!title) return notFound();

  const rows = await knex
    .select({
      content: "h.content",
      name: "u.name",
      email: "u.email",
      created: "h.created",
    })
    .from({ h: history })
    .join({ u: "user" }, "u.id", "=", "h.userId")
    .where("h.docId", id)
    .andWhere("h.created", "<=", created)
    .orderBy("h.created", "desc")
    .limit(2);

  const [curr, prev] = rows;

  const dateFormater = new Intl.DateTimeFormat(lngParam, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("post") },
    { title: t("change history") },
    {
      title: title,
      href: `${lng}/${doctype}/history?${new URLSearchParams({ id })}`,
    },
    {
      title: t("diff"),
      href: `${lng}/${doctype}/diff?${new URLSearchParams({ id, created: searchParams.created as string })}`,
    },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />

      <Viewport className="!justify-start flex-col items-center">
        <Container as="div" variant="wide">
          <PageHeadline title={t("compare changes")} description={title} prose />

          <div className="mt-6 mb-2 flex flex-col items-end">
            <p className="!m-0 font-mono text-muted-foreground text-sm">
              변경전: {dateFormater.format(prev.created)}{" "}
              <sub>
                (
                <a
                  href={`mailto:${prev.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 no-underline hover:underline"
                >
                  {prev.name}
                </a>
                )
              </sub>
            </p>
            <p className="!m-0 font-mono text-muted-foreground text-sm">
              변경후: {dateFormater.format(curr.created)}{" "}
              <sub>
                (
                <a
                  href={`mailto:${curr.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 no-underline hover:underline"
                >
                  {curr.name}
                </a>
                )
              </sub>
            </p>
          </div>

          <DiffViewer curr={curr.content} prev={prev.content} />
        </Container>
      </Viewport>
    </>
  );
}
