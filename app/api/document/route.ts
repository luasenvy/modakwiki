import { diffChars } from "diff";
import kebabcase from "lodash.kebabcase";
import { NextRequest } from "next/server";

import OpenAI from "openai";
import { openai as openaiConfig } from "@/config";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { clear as clearMarkdown, humanReadable } from "@/lib/mdx/utils";
import { Doctype, DocumentForm, doctypeEnum, getTablesByDoctype } from "@/lib/schema/document";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const rows = await knex
    .select({ id: "t.id", title: "t.title", type: "t.type" })
    .fromRaw(
      knex.raw(
        `(
            SELECT d.id, d.title, '${doctypeEnum.document}' as type FROM document d
            UNION ALL
            SELECT p.id, p.title, '${doctypeEnum.post}' as type FROM post p
         ) as t`,
      ),
    )
    .orderBy("t.title", "asc");

  return Response.json(rows, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const {
    type: doctype,
    title,
    description,
    content,
    category,
    license,
    tags,
  }: DocumentForm = await req.json();

  const { table, history, tag: tagTable } = getTablesByDoctype(doctype);

  if (!tags?.length) return new Response("There is no tags", { status: 400 });
  if (!table || !history || !tagTable) return new Response(null, { status: 400 });

  const { count } = (await knex
    .count<{ count: number }>({ count: "*" })
    .from(tagTable)
    .where({ category })
    .whereIn("id", tags)
    .first())!;

  if (Number(count) !== tags?.length) return new Response("Bad Request", { status: 400 });

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

  const [{ id }] = await knex(table)
    .insert({
      id: kebabcase(title),
      title,
      description,
      content,
      userId: session.user.id,
      preview: clearMarkdown(humanReadable(content).substring(0, 150)),
      license,
      category,
      tags,
      images,
    })
    .returning(["id"]);

  await knex(history).insert({
    docId: id,
    description,
    content,
    userId: session.user.id,
    license,
    category,
    tags,
  });

  return Response.json({ id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const {
    id,
    type: doctype,
    content,
    description,
    license,
    category,
    tags,
  }: DocumentForm & { type: Doctype } = await req.json();

  const { table, history, tag } = getTablesByDoctype(doctype);
  if (!table) return new Response("Bad Request", { status: 400 });

  if (!tags?.length) return new Response("There is no tags", { status: 400 });

  const { count } = (await knex
    .count<{ count: number }>({ count: "*" })
    .from(tag)
    .where({ category })
    .whereIn("id", tags)
    .first())!;

  if (Number(count) !== tags?.length) return new Response("Bad Request", { status: 400 });

  const prev = (await knex
    .select({
      description: "d.description",
      content: "d.content",
      category: "d.category",
      tags: "d.tags",
    })
    .from({ d: table })
    .where({ "d.id": id })
    .first())!;

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

  await knex(table)
    .update({
      content,
      preview: clearMarkdown(humanReadable(content).substring(0, 150)),
      description,
      license,
      category,
      tags,
      images: isDocumentChange ? images : undefined,
      updated: knex.raw(`extract(epoch FROM current_timestamp) * 1000`),
    })
    .where({ id });

  await knex
    .insert({
      docId: id,
      description,
      content,
      userId: session.user.id,
      added: isDocumentChange ? added : 0,
      removed: isDocumentChange ? removed : 0,
      category,
      tags,
      license,
    })
    .into(history);

  return Response.json({ id }, { status: 200 });
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

  const updatedCount = await knex(table)
    .update({
      deleted: knex.raw(`extract(epoch FROM current_timestamp) * 1000`),
    })
    .where({ id, userId: session.user.id });

  if (!updatedCount) return new Response(null, { status: 404 });
  return new Response(null, { status: 204 });
}
