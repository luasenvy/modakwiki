import type { NextRequest } from "next/server";

import { defaultNS, fallbackLng } from "@/lib/i18n/config";

export async function GET(req: NextRequest, ctx: RouteContext<"/languages/[lng]/[ns]">) {
  const { lng = fallbackLng, ns = defaultNS } = await ctx.params;

  const { default: message } = await import(`@/lib/i18n/languages/${lng}/${ns}.json`);

  return Response.json(message);
}
