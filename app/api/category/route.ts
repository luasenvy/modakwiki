import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { knex } from "@/lib/db";
import { CategoryForm } from "@/lib/schema/category";
import { Doctype, getTablesByDoctype } from "@/lib/schema/document";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) return new Response(null, { status: 400 });

  const { category: categoryTable } = getTablesByDoctype(type as Doctype);
  if (!categoryTable) return new Response(null, { status: 400 });

  const rows = await knex.select("id").from(categoryTable).orderBy("id", "asc");

  return Response.json(
    rows.map(({ id }) => id),
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, type }: CategoryForm = await req.json();
  if (!type) return new Response(null, { status: 400 });

  const { category: categoryTable } = getTablesByDoctype(type as Doctype);
  if (!categoryTable) return new Response(null, { status: 400 });

  await knex.insert({ id }).into(categoryTable);

  return new Response(null, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const { id, name, type }: CategoryForm = await req.json();
  if (!type) return new Response(null, { status: 400 });

  const { category: categoryTable } = getTablesByDoctype(type as Doctype);
  if (!categoryTable) return new Response(null, { status: 400 });

  await knex
    .update({ id: name, updated: knex.raw("extract(epoch FROM current_timestamp) * 1000") })
    .from(categoryTable)
    .where({ id });

  return new Response(null, { status: 204 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const type = req.nextUrl.searchParams.get("type");
  if (!type) return new Response(null, { status: 400 });

  const { category: categoryTable } = getTablesByDoctype(type as Doctype);
  if (!categoryTable) return new Response(null, { status: 400 });

  const id = req.nextUrl.searchParams.get("id");

  await knex.from(categoryTable).where({ id }).del();

  return new Response(null, { status: 204 });
}
