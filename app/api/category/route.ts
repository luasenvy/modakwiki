import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { CategoryForm } from "@/lib/schema/category";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const rows = await knex.select("id").from("category").orderBy("id", "asc");

  return Response.json(
    rows.map(({ id }) => id),
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id }: CategoryForm = await req.json();

  await knex.insert({ category: id }).into("category");

  return new Response(null, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, name }: CategoryForm = await req.json();

  await knex("category")
    .update({ id: name, updated: knex.raw("extract(epoch FROM current_timestamp) * 1000") })
    .where({ id });

  return new Response(null, { status: 204 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");

  await knex("category").where({ id }).del();

  return new Response(null, { status: 204 });
}
