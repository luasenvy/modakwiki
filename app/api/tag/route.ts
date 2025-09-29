import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { Doctype, getTablesByDoctype } from "@/lib/schema/document";
import { TagForm } from "@/lib/schema/tag";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) return new Response(null, { status: 400 });

  const { tag: tagTable } = getTablesByDoctype(type as Doctype);
  if (!tagTable) return new Response(null, { status: 400 });

  const category = req.nextUrl.searchParams.get("category");

  const rows = await knex
    .select({ id: "id", category: "category" })
    .from(tagTable)
    .where({ category });

  return Response.json(rows, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, category, type }: TagForm = await req.json();
  if (!type) return new Response(null, { status: 400 });

  const { tag: tagTable } = getTablesByDoctype(type as Doctype);
  if (!tagTable) return new Response(null, { status: 400 });

  await knex.insert({ id, category }).into(tagTable);

  return new Response(null, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, category, name, type }: TagForm = await req.json();
  if (!type) return new Response(null, { status: 400 });

  const { tag: tagTable } = getTablesByDoctype(type as Doctype);
  if (!tagTable) return new Response(null, { status: 400 });

  await knex(tagTable)
    .update({
      id: name,
      updated: knex.raw("extract(epoch FROM current_timestamp) * 1000"),
    })
    .where({ category, id });

  await knex("post")
    .update({ tags: knex.raw("array_replace(tags, ?, ?)", [id, name]) })
    .whereRaw(knex.raw("? = ANY (tags)", [id]));

  return new Response(null, { status: 204 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const type = req.nextUrl.searchParams.get("type");
  if (!type) return new Response(null, { status: 400 });

  const { tag: tagTable } = getTablesByDoctype(type as Doctype);
  if (!tagTable) return new Response(null, { status: 400 });

  const category = req.nextUrl.searchParams.get("category");
  const id = req.nextUrl.searchParams.get("id");

  await knex.from(tagTable).where({ category, id }).del();

  return new Response(null, { status: 204 });
}
