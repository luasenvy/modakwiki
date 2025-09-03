import { Container, Viewport } from "@/components/core/Container";
import { DiffViewer } from "@/components/core/DiffViewer";
import { Separator } from "@/components/ui/separator";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";
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
    const {
      rows: [{ title }],
    } = await client.query<DocumentType>(
      `SELECT title
         FROM document
        WHERE id = $1
          AND type = $2`,
      [id, doctype],
    );

    const { rows } = await client.query<DocumentHistory>(
      `SELECT h.content
            , u.name
            , h.created
         FROM history h
         JOIN "user" u ON u.email = h.email
        WHERE h.id = $1
          AND h.type = $2
          AND h.created <= $3
     ORDER BY h.created DESC
      LIMIT 2`,
      [id, doctype, created],
    );

    const [curr, prev] = rows;

    const dateFormater = new Intl.DateTimeFormat(lngParam, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hourCycle: "h23",
      hour: "2-digit",
      minute: "numeric",
      second: "numeric",
    });

    return (
      <Viewport className="!justify-start flex-col items-center">
        <Container
          as="article"
          className={cn(
            "relative w-full max-w-full px-4 lg:max-w-[calc(var(--container-3xl)_+_286px)] xl:max-w-[calc(var(--container-4xl)_+_286px)]",
            "prose dark:prose-invert max-w-none",
            "prose-pre:max-h-[calc(100dvh_-_var(--spacing)_*_80)]",
          )}
        >
          <h2>
            변경점 비교: {title} <sub>( {dateFormater.format(curr.created)} )</sub>
          </h2>
          <div className="mt-6 flex flex-col items-end">
            <p className="!m-0 font-mono text-muted-foreground text-sm">
              변경전: {dateFormater.format(prev.created)}
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
