import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { TagForm } from "@/lib/schema/tag";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  const rows = await knex
    .select({ id: "t.id", category: "t.category" })
    .from({ t: "tag" })
    .where({ category });

  return Response.json(rows, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, category }: TagForm = await req.json();

  await knex.insert({ id, category }).into("tag");

  return new Response(null, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, category, name }: TagForm = await req.json();

  await knex("tag")
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

  const category = req.nextUrl.searchParams.get("category");
  const id = req.nextUrl.searchParams.get("id");

  await knex("tag").where({ category, id }).del();

  return new Response(null, { status: 204 });
}
