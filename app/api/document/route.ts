import { diffChars } from "diff";
import kebabcase from "lodash.kebabcase";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { clear as clearMarkdown, humanReadable } from "@/lib/mdx/utils";
import { DocumentForm, Document as DocumentType } from "@/lib/schema/document";
import { scopeEnum } from "@/lib/schema/user";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { type, title, content }: DocumentForm = await req.json();

    const {
      rows: [{ id }],
    } = await client.query(
      `INSERT INTO document (id, title, content, email, type, preview)
                     VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id`,
      [
        kebabcase(title),
        title,
        content,
        session.user.email,
        type,
        clearMarkdown(humanReadable(content).substring(0, 150)),
      ],
    );

    await client.query(
      `INSERT INTO history (id, content, type, email)
                    VALUES ($1, $2, $3, $4)`,
      [id, content, type, session.user.email],
    );

    return Response.json({ id }, { status: 201 });
  } finally {
    client.release();
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { id, type, content }: DocumentForm = await req.json();

    const {
      rows: [prev],
    } = await client.query<DocumentType>(`SELECT type, content FROM document WHERE id = $1`, [id]);

    const { added, removed } = diffChars(prev.content, content).reduce(
      (acc, { added, removed, count }) => {
        if (added) acc.added += count;
        if (removed) acc.removed += count;
        return acc;
      },
      { added: 0, removed: 0 },
    );

    if (!added && !removed) return new Response(null, { status: 409 });

    await client.query(
      `UPDATE document
          SET content = $1
            , type = $2
            , preview = $3
            , updated = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $4`,
      [content, type, clearMarkdown(humanReadable(content).substring(0, 150)), id],
    );

    await client.query(
      `INSERT INTO history (id, content, type, email, added, removed)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, content, type, session.user.email, added, removed],
    );

    return Response.json({ id }, { status: 200 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/document">) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return new Response(null, { status: 404 });

  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      `UPDATE document
          SET deleted = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $1
          AND email = $2`,
      [id, session.user.email],
    );

    if (!rowCount) return new Response(null, { status: 404 });
    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
