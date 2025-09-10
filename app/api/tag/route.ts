import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";
import { Tag, TagForm } from "@/lib/schema/tag";
import { scopeEnum } from "@/lib/schema/user";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  const client = await pool.connect();
  try {
    const { rows } = await client.query<Tag>(`SELECT id, category FROM tag WHERE category = $1`, [
      category,
    ]);

    return Response.json(rows, { status: 200 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { id, category }: TagForm = await req.json();

    await client.query(`INSERT INTO tag (id, category) VALUES ($1, $2)`, [id, category]);

    return new Response(null, { status: 201 });
  } finally {
    client.release();
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const client = await pool.connect();
  try {
    const { id, category, name }: TagForm = await req.json();

    await client.query(
      `UPDATE tag
          SET id = $1
            , updated = extract(epoch FROM current_timestamp) * 1000
          WHERE category = $2
          AND id = $3`,
      [name, category, id],
    );

    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session) return new Response(null, { status: 401 });
  if (session.user.scope < scopeEnum.admin) return new Response(null, { status: 403 });

  const category = req.nextUrl.searchParams.get("category");
  const id = req.nextUrl.searchParams.get("id");

  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM tag WHERE category = $1 AND id = $2`, [category, id]);

    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
