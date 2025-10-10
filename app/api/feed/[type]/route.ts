import { MetadataRoute } from "next";
import type { NextRequest } from "next/server";
import { site } from "@/config";
import { knex } from "@/lib/db";
import { FeedType, feedColumns, feedEnum, frequencyEnum, getFeed } from "@/lib/feed";
import { cookieName, languages } from "@/lib/i18n/config";
import { negotiate } from "@/lib/i18n/detect";
import { redis } from "@/lib/redis";
import { doctypeEnum } from "@/lib/schema/document";
import { HOUR } from "@/lib/time";
import Logo from "@/public/brand/logo.webp";

let expired = 0;

function alternates(url: string) {
  return {
    languages: languages.reduce(
      (acc, language) => ({
        ...acc,
        [language]: `${site.baseurl}/${language}${url}`,
      }),
      {},
    ),
  };
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/feed/[type]">) {
  const feed = await getFeed();

  const type = (await ctx.params).type as FeedType;
  if (feedEnum.sitemap === type) {
    const locale = negotiate(
      req.cookies.get(cookieName)?.value || req.headers.get("accept-language"),
    );

    if (!redis.isOpen) await redis.connect();

    if (Date.now() <= expired)
      return Response.json(await redis.json.get(`sitemap:${locale}`, { path: "." }));

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
    const items = [
      {
        url: site.baseurl,
        alternates: alternates(""),
        lastModified: new Date(),
        changeFrequency: frequencyEnum.monthly,
        priority: 1,
        images: [Logo.src],
      },
      {
        url: `${site.baseurl}/what-is-this`,
        changeFrequency: frequencyEnum.monthly,
        priority: 0.6,
        lastModified: started,
        alternates: alternates("/what-is-this"),
      },
      {
        url: `${site.baseurl}/random`,
        changeFrequency: frequencyEnum.monthly,
        priority: 0.6,
        lastModified: started,
        alternates: alternates("/random"),
      },
      {
        url: `${site.baseurl}/popular`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
        alternates: alternates("/popular"),
      },
      {
        url: `${site.baseurl}/list`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
        alternates: alternates("/list"),
      },
      {
        url: `${site.baseurl}/series`,
        changeFrequency: frequencyEnum.weekly,
        priority: 0.6,
        lastModified: started,
        alternates: alternates("/series"),
      },
      ...rows.map(({ id, type, images, created, updated }) => {
        const url = `/${type}?${new URLSearchParams({ id })}`;
        return {
          url: `${site.baseurl}${url}`,
          changeFrequency: frequencyEnum.monthly,
          priority: 0.6,
          lastModified:
            updated && created !== updated ? new Date(Number(updated)) : new Date(Number(created)),
          images: images?.map((src: string) =>
            new URL(`/api/image${src}`, site.baseurl).toString(),
          ),
          alternates: alternates(url),
        };
      }),
    ];

    redis.json.set("sitemap", ".", items).then(() => {
      console.info("cache stored..");
      expired = Date.now() + HOUR;
    });

    return Response.json(items);
  }

  if (feedEnum.rss === type || feedEnum.rss2 === type)
    return new Response(feed.rss2(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.atom === type)
    return new Response(feed.atom1(), { headers: { "Content-Type": "application/xml" } });

  if (feedEnum.json === type)
    return new Response(feed.json1(), { headers: { "Content-Type": "application/json" } });

  return new Response("Invalid feed type", { status: 400 });
}
