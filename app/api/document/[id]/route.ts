import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { pool } from "@/lib/db";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/document/[id]">) {
  const session = await auth.api.getSession(req);
  if (!session?.user.email) return new Response(null, { status: 403 });

  const id = (await ctx.params).id;

  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE document
          SET deleted = extract(epoch FROM current_timestamp) * 1000
        WHERE id = $1
          AND email = $2`,
      [id, session.user.email],
    );

    console.info(id, session.user.email, "updated?");
    return new Response(null, { status: 204 });
  } finally {
    client.release();
  }
}
