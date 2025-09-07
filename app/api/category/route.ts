import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Category, CategoryForm } from "@/lib/schema/category";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<Category>(`SELECT id FROM category ORDER BY id ASC`);

    return Response.json(
      rows.map(({ id }) => id),
      { status: 200 },
    );
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { id }: CategoryForm = await req.json();

    await client.query(`INSERT INTO category (id) VALUES ($1)`, [id]);

    return new Response(null, { status: 201 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");

  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM category WHERE id = $1`, [id]);

    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
