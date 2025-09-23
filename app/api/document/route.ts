import { diffChars } from "diff";
import kebabcase from "lodash.kebabcase";
import { NextRequest } from "next/server";

import OpenAI from "openai";
import { openai as openaiConfig } from "@/config";
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
      license,
      tags,
    }: DocumentForm = await req.json();

    const { table, history } = getTablesByDoctype(doctype);
    const isEssay = doctypeEnum.essay === doctype;

    if (isEssay) {
      if (!tags?.length) return new Response("There is no tags", { status: 400 });

      const {
        rows: [{ count }],
      } = await client.query<{ count: number }>(
        `SELECT COUNT(*) as count
          FROM tag
         WHERE "category" = $1
           AND id IN (${tags.map((tag) => `'${tag}'`).join(",")})
         `,
        [category],
      );

      if (Number(count) !== tags?.length) return new Response("Bad Request", { status: 400 });
    }

    // moderation
    const openai = new OpenAI(openaiConfig);
    const { results } = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: content,
    });

    if (results.some(({ flagged }) => flagged)) {
      const categories = results.reduce(
        (acc, { categories }) =>
          new Set(
            Array.from(acc).concat(
              Object.entries(categories)
                .filter(([, value]) => value)
                .map(([name]) => name),
            ),
          ),
        new Set<string>(),
      );

      return Response.json(Array.from(categories), { status: 415 });
    }

    let images: string[] = [];
    const matches = content.match(/!\[[^\]]+?\]\(([^\)]+?)\)/g);
    if (matches?.length) {
      images = matches.slice(0, 5).map((img) =>
        img
          .replace(/!\[[^\]]+?\]\(([^\)]+?)\)/, "$1")
          .replace(/-(o|t)$/, "")
          .concat("-t"),
      );
    }

    const sql = isEssay
      ? `INSERT INTO ${table} (id, title, description, content, "userId", preview, license, category, tags, images)
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '{${tags?.map((tag) => `"${tag}"`).join(",")}}', '{${images?.map((img) => `"${img}"`).join(",")}}')
          RETURNING id`
      : `INSERT INTO ${table} (id, title, description, content, "userId", preview, license, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, '{${images?.map((img) => `"${img}"`).join(",")}}')
          RETURNING id`;

    const params: Array<string | string[] | undefined | null> = [
      kebabcase(title),
      title,
      description,
      content,
      session.user.id,
      clearMarkdown(humanReadable(content).substring(0, 150)),
      license,
    ];

    if (isEssay) params.push(category);

    const {
      rows: [{ id }],
    } = await client.query(sql, params);

    const historySql = isEssay
      ? `INSERT INTO ${history} ("docId", description, content, "userId", license, category, tags)
                       VALUES ($1, $2, $3, $4, $5, $6, '{${tags?.map((tag) => `"${tag}"`).join(",")}}')`
      : `INSERT INTO ${history} ("docId", description, content, license, "userId")
                       VALUES ($1, $2, $3, $4, $5)`;
    const historyParams = isEssay
      ? [id, description, content, session.user.id, license, category]
      : [id, description, content, license, session.user.id];

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
    const {
      id,
      type: doctype,
      content,
      description,
      license,
      category,
      tags,
    }: DocumentForm & { type: Doctype } = await req.json();

    const { table, history } = getTablesByDoctype(doctype);
    if (!table) return new Response("Bad Request", { status: 400 });

    const isEssay = doctypeEnum.essay === doctype;
    if (isEssay) {
      if (!tags?.length) return new Response("There is no tags", { status: 400 });

      const {
        rows: [{ count }],
      } = await client.query<{ count: number }>(
        `SELECT COUNT(*) as count
          FROM tag
         WHERE "category" = $1
           AND id IN (${tags.map((tag) => `'${tag}'`).join(",")})
         `,
        [category],
      );

      if (Number(count) !== tags?.length) return new Response("Bad Request", { status: 400 });
    }

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
    const isDocumentChange = added > 0 || removed > 0;
    const isMetadataChange =
      description !== prev.description ||
      category !== prev.category ||
      JSON.stringify(tags) !== JSON.stringify(prev.tags);

    // Nothing to changed
    if (!isDocumentChange && !isMetadataChange) return new Response(null, { status: 409 });

    // moderation
    const openai = new OpenAI(openaiConfig);
    const { results } = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: content,
    });

    if (results.some(({ flagged }) => flagged)) {
      const categories = results.reduce(
        (acc, { categories }) =>
          new Set(
            Array.from(acc).concat(
              Object.entries(categories)
                .filter(([, value]) => value)
                .map(([name]) => name),
            ),
          ),
        new Set<string>(),
      );

      return Response.json(Array.from(categories), { status: 415 });
    }

    let images: string[] = [];
    if (isDocumentChange) {
      // moderation
      const openai = new OpenAI(openaiConfig);
      const { results } = await openai.moderations.create({
        model: "text-moderation-stable",
        input: content,
      });

      if (results.some(({ flagged }) => flagged)) {
        const categories = results.reduce(
          (acc, { categories }) =>
            new Set(
              Array.from(acc).concat(
                Object.entries(categories)
                  .filter(([, value]) => value)
                  .map(([name]) => name),
              ),
            ),
          new Set<string>(),
        );

        return Response.json(Array.from(categories), { status: 400 });
      }

      const matches = content.match(/!\[[^\]]+?\]\(([^\)]+?)\)/g);
      if (matches?.length) {
        images = matches.slice(0, 5).map((img) =>
          img
            .replace(/!\[[^\]]+?\]\(([^\)]+?)\)/, "$1")
            .replace(/-(o|t)$/, "")
            .concat("-t"),
        );
      }
    }

    await client.query(
      `UPDATE ${table}
          SET content = $1
            , preview = $2
            , description = $3
            , license = $4
            , category = $5
            , tags = $6
            , images = $7
            , updated = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $8`,
      [
        content,
        clearMarkdown(humanReadable(content).substring(0, 150)),
        description,
        license,
        category,
        tags,
        images,
        id,
      ],
    );

    await client.query(
      `INSERT INTO ${history} ("docId", description, content, "userId", added, removed, category, tags, license)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, description, content, session.user.id, added, removed, category, tags, license],
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
          AND "userId" = $2`,
      [id, session.user.id],
    );

    if (!rowCount) return new Response(null, { status: 404 });
    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
