import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Document } from "@/components/core/Document";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const doctype = params.doctype as Doctype;

  const id = (await ctx.searchParams).id;

  if (!id) return notFound();

  const client = await pool.connect();
  try {
    const {
      rows: [doc],
    } = await client.query<DocumentType>(
      `SELECT id, title, content, email
         FROM document
        WHERE id = $1
          AND type = $2
          AND deleted IS NULL`,
      [id, doctype],
    );

    const session = await auth.api.getSession({ headers: await headers() });

    return <Document lng={lngParam} doc={doc} session={session} />;
  } finally {
    client.release();
  }
}
