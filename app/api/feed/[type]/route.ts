import type { NextRequest } from "next/server";

import { FeedType, feedEnum, getFeed } from "@/lib/feed";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/feed/[type]">) {
  const feed = await getFeed();

  const type = (await ctx.params).type as FeedType;
  if (feedEnum.rss === type || feedEnum.rss2 === type)
    return new Response(feed.rss2(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.atom === type)
    return new Response(feed.atom1(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.json === type)
    return new Response(feed.json1(), { headers: { "Content-Type": "application/json" } });

  return new Response("Invalid feed type", { status: 400 });
}
