import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { TagForm } from "@/lib/schema/tag";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.editor) return new Response(null, { status: 403 });

  const category = req.nextUrl.searchParams.get("category");

  const client = await pool.connect();
  try {
    const {
      rows: [{ tags }],
    } = await client.query(`SELECT tags FROM tag WHERE category = $1`, [category]);

    return Response.json(tags || [], { status: 200 });
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
    const { category }: TagForm = await req.json();

    await client.query(`INSERT INTO tag (category) VALUES ($1)`, [category]);

    return Response.json({ category }, { status: 201 });
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
    const { category, tags }: TagForm = await req.json();

    await client.query(
      `UPDATE tag
          SET tags = array_append(tags, $1)
        WHERE category = $2`,
      [tags, category],
    );

    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
