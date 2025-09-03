import Link from "next/link";
import { Container, Viewport } from "@/components/core/Container";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";
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
    const {
      rows: [{ title }],
    } = await client.query<DocumentType>(
      `SELECT title
         FROM document
        WHERE id = $1
          AND type = $2`,
      [id, doctype],
    );

    const { rows } = await client.query<DocumentHistory & { name: string }>(
      `SELECT h.added
            , h.email
            , u.name
            , h.removed
            , h.created
         FROM history h
         JOIN "user" u ON u.email = h.email
        WHERE h.id = $1
          AND h.type = $2
     ORDER BY h.created DESC`,
      [id, doctype],
    );

    const dateFormater = new Intl.DateTimeFormat(lngParam);
    const numberFormat = new Intl.NumberFormat(lngParam);

    return (
      <Viewport className="!justify-start flex-col items-center">
        <Container
          className={cn(
            "relative w-full max-w-full px-4 lg:max-w-[calc(var(--container-3xl)_+_286px)] xl:max-w-[calc(var(--container-4xl)_+_286px)]",
            "prose dark:prose-invert max-w-none",
          )}
        >
          <h2>{title}</h2>

          <div>
            {rows.map(({ added, removed, name, email, created }, i) => {
              const isChanged = added + removed > 0;

              return (
                <div
                  key={`history-${i}`}
                  className="flex py-0.5 hover:bg-accent/80 max-sm:flex-col sm:items-center"
                >
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
                          <span className="text-green-600">+{numberFormat.format(added)}</span> |{" "}
                          <span className="text-red-600">-{numberFormat.format(removed)}</span>
                        </>
                      ) : (
                        "문서 생성됨"
                      )}
                    </Link>
                  </p>

                  <div className="ml-auto flex gap-1 max-sm:flex-col sm:items-center">
                    <p className="!my-0">
                      <a
                        href={`mailto:${email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 no-underline hover:underline"
                      >
                        {name}
                      </a>
                    </p>
                    <p className="!my-0">{dateFormater.format(created)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Viewport>
    );
  } finally {
    client.release();
  }
}
