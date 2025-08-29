import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const json = await req.json();

  console.info(json);
  return new Response(null, { status: 201 });
}
