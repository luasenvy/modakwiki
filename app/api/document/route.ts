import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { DocumentForm } from "@/lib/schema/document";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req);
  if (!session?.user.email) return new Response(null, { status: 403 });

  const { type, title, content }: DocumentForm = await req.json();

  return Response.json({
    type,
    title,
    content,
    email: session.user.email,
  });
}
