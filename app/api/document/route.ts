import kebabcase from "lodash.kebabcase";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { clear as clearMarkdown, humanReadable } from "@/lib/mdx/utils";
import { DocumentForm } from "@/lib/schema/document";
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

    return Response.json({ id }, { status: 201 });
  } finally {
    client.release();
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { id, type, content }: DocumentForm = await req.json();

    await client.query(
      `UPDATE document
          SET content = $3
            , type = $4
            , preview = $5
            , updated = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $6`,
      [content, type, clearMarkdown(humanReadable(content).substring(0, 150)), id],
    );

    await client.query(
      `INSERT INTO history (id, content, type, email)
                    VALUES ($1, $2, $3, $4)`,
      [id, content, type, session.user.email],
    );

    return Response.json({ id }, { status: 200 });
  } finally {
    client.release();
  }
}
