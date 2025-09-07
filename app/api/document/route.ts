import { diffChars } from "diff";
import kebabcase from "lodash.kebabcase";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { clear as clearMarkdown, humanReadable } from "@/lib/mdx/utils";
import {
  Doctype,
  DocumentForm,
  Document as DocumentType,
  doctypeEnum,
  getTablesByDoctype,
} from "@/lib/schema/document";
import { scopeEnum } from "@/lib/schema/user";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const {
      type: doctype,
      title,
      description,
      content,
      category,
      tags,
    }: DocumentForm = await req.json();

    const { table, history } = getTablesByDoctype(doctype);
    const isEssay = doctypeEnum.essay === doctype;
    const sql = isEssay
      ? `INSERT INTO ${table} (id, title, description, content, email, preview, category, tags)
                VALUES ($1, $2, $3, $4, $5, $6, $7, '{${tags?.map((tag) => `"${tag}"`).join(",")}}')
          RETURNING id`
      : `INSERT INTO ${table} (id, title, description, content, email, preview)
                VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`;

    const params: Array<string | string[] | undefined | null> = [
      kebabcase(title),
      title,
      description,
      content,
      session.user.email,
      clearMarkdown(humanReadable(content).substring(0, 150)),
    ];

    if (isEssay) params.push(category);

    const {
      rows: [{ id }],
    } = await client.query(sql, params);

    const historySql = isEssay
      ? `INSERT INTO ${history} (id, description, content, email, category, tags)
                       VALUES ($1, $2, $3, $4, $5, '{${tags?.map((tag) => `"${tag}"`).join(",")}}')`
      : `INSERT INTO ${history} (id, description, content, email)
                       VALUES ($1, $2, $3, $4)`;
    const historyParams = isEssay
      ? [id, description, content, session.user.email, category]
      : [id, description, content, session.user.email];

    await client.query(historySql, historyParams);

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
    const { id, type, content, description }: DocumentForm & { type: Doctype } = await req.json();

    const { table, history } = getTablesByDoctype(type);
    if (!table) return new Response("Bad Request", { status: 400 });

    const {
      rows: [prev],
    } = await client.query<DocumentType>(
      `SELECT description, content FROM ${table} WHERE id = $1`,
      [id],
    );

    const { added, removed } = diffChars(prev.content, content).reduce(
      (acc, { added, removed, count }) => {
        if (added) acc.added += count;
        if (removed) acc.removed += count;
        return acc;
      },
      { added: 0, removed: 0 },
    );

    if (
      !added &&
      !removed &&
      ((!Boolean(description) && !Boolean(prev.description)) || description === prev.description)
    )
      return new Response(null, { status: 409 });

    await client.query(
      `UPDATE ${table}
          SET content = $1
            , preview = $2
            , description = $3
            , updated = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $4`,
      [content, clearMarkdown(humanReadable(content).substring(0, 150)), description, id],
    );

    await client.query(
      `INSERT INTO ${history} (id, description, content, email, added, removed)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, description, content, session.user.email, added, removed],
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

  const doctype = req.nextUrl.searchParams.get("type") as Doctype;

  const { table } = getTablesByDoctype(doctype);
  if (!table) return new Response("Bad Request", { status: 400 });

  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      `UPDATE ${table}
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
