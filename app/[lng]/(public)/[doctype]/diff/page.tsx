import { notFound } from "next/navigation";
import { Container, Viewport } from "@/components/core/Container";
import { DiffViewer } from "@/components/core/DiffViewer";
import { PageHeadline } from "@/components/core/PageHeadline";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, Document as DocumentType, getTablesByDoctype } from "@/lib/schema/document";
import { History as DocumentHistory } from "@/lib/schema/history";
import { cn } from "@/lib/utils";

export default async function DiffPage(ctx: PageProps<"/[lng]/[doctype]/history">) {
  const params = await ctx.params;
  const lngParam = params.lng as Language;
  const doctype = params.doctype as Doctype;

  // const lng = localePrefix(lngParam);

  const id = (await ctx.searchParams).id as string;
  const created = Number((await ctx.searchParams).created as string);

  const client = await pool.connect();
  try {
    const { table, history } = getTablesByDoctype(doctype);
    if (!table) return notFound();

    const {
      rows: [{ title }],
    } = await client.query<DocumentType>(
      `SELECT title
         FROM ${table}
        WHERE id = $1
          AND deleted IS NULL`,
      [id],
    );

    if (!title) return notFound();

    const { rows } = await client.query<DocumentHistory & { name: string }>(
      `SELECT h.content
            , u.name
            , u.email
            , h.created
         FROM ${history} h
         JOIN "user" u ON u.email = h.email
        WHERE h.id = $1
          AND h.created <= $2
     ORDER BY h.created DESC
      LIMIT 2`,
      [id, created],
    );

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

    return (
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
                  className="text-blue-500 no-underline hover:underline"
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
                  className="text-blue-500 no-underline hover:underline"
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
    );
  } finally {
    client.release();
  }
}
