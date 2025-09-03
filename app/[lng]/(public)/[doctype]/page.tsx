import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Document } from "@/components/core/Document";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]">) {
  const params = await ctx.params;
  const searchParams = await ctx.searchParams;

  const lngParam = params.lng as Language;
  const doctype = params.doctype as Doctype;

  const id = searchParams.id;
  const created = searchParams.created;

  if (!id) return notFound();

  const client = await pool.connect();
  try {
    let doc;
    if (created) {
      const {
        rows: [_doc],
      } = await client.query<DocumentType>(
        `SELECT d.id
              , d.title
              , h.content
              , h.email
         FROM history h
         JOIN document d
           ON d.id = h.id
        WHERE h.id = $1
          AND h.type = $2
          AND h.created = $3
          AND d.deleted IS NULL`,
        [id, doctype, created],
      );
      doc = _doc;
    } else {
      const {
        rows: [_doc],
      } = await client.query<DocumentType>(
        `SELECT id, title, content, email
           FROM document
          WHERE id = $1
            AND type = $2
            AND deleted IS NULL`,
        [id, doctype],
      );
      doc = _doc;
    }

    const session = await auth.api.getSession({ headers: await headers() });

    return <Document lng={lngParam} doc={doc} session={session} />;
  } finally {
    client.release();
  }
}
