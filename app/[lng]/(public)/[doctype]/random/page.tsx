import { notFound, redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export default async function WikiDocPage(ctx: PageProps<"/[lng]/[doctype]/random">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);
  const doctype = params.doctype as Doctype;

  const client = await pool.connect();
  try {
    const {
      rows: [doc],
    } = await client.query<DocumentType>(
      `SELECT id, title, content, email
         FROM document
  TABLESAMPLE SYSTEM (100)
        WHERE type = $1
        LIMIT 1`,
      [doctype],
    );

    if (!doc) return notFound();

    return redirect(`${lng}/${doctype}?${new URLSearchParams({ id: doc.id })}`);
  } finally {
    client.release();
  }
}
