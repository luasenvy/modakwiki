import type { NextRequest } from "next/server";
import { site } from "@/config";
import { knex } from "@/lib/db";
import { FeedType, feedColumns, feedEnum, frequencyEnum, getFeed } from "@/lib/feed";
import { cookieName, languageEnum, languages } from "@/lib/i18n/config";
import { negotiate } from "@/lib/i18n/detect";
import { Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import Logo from "@/public/brand/logo.webp";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/feed/[type]">) {
  const feed = await getFeed();

  const type = (await ctx.params).type as FeedType;
  if (feedEnum.sitemap === type) {
    const rows = await knex
      .select({
        id: "o.id",
        type: "o.type",
        created: "o.created",
        updated: "o.updated",
        images: "o.images",
      })
      .from(
        knex
          .unionAll([
            knex
              .select({
                ...feedColumns,
                type: knex.raw(`'${doctypeEnum.document}'`),
              })
              .from("document")
              .whereNull("deleted"),
            knex
              .select({
                ...feedColumns,
                type: knex.raw(`'${doctypeEnum.post}'`),
              })
              .from("post")
              .whereNull("deleted"),
          ])
          .as("o"),
      )
      .orderBy("created", "asc");

    const started = new Date();

    const locale = negotiate(
      req.cookies.get(cookieName)?.value || req.headers.get("accept-language"),
    );

    return Response.json([
      {
        url: site.baseurl,
        lastModified: new Date(),
        changeFrequency: frequencyEnum.monthly,
        priority: 1,
        images: [Logo.src],
      },
      {
        url: `${site.baseurl}/${locale}/what-is-this`,
        changeFrequency: frequencyEnum.monthly,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${locale}/random`,
        changeFrequency: frequencyEnum.monthly,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${locale}/popular`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${locale}/list`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${locale}/series`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
      },
      ...rows.map(({ id, type, images, created, updated }) => {
        return {
          url: `${site.baseurl}/${locale}/${type}?${new URLSearchParams({ id })}`,
          changeFrequency: frequencyEnum.monthly,
          priority: 0.6,
          lastModified:
            updated && created !== updated ? new Date(Number(updated)) : new Date(Number(created)),
          images: images?.map((src: string) => new URL(`/api/image${src}`, site.baseurl)),
        };
      }),
    ]);
  }
  if (feedEnum.rss === type || feedEnum.rss2 === type)
    return new Response(feed.rss2(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.atom === type)
    return new Response(feed.atom1(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.json === type)
    return new Response(feed.json1(), { headers: { "Content-Type": "application/json" } });

  return new Response("Invalid feed type", { status: 400 });
}
