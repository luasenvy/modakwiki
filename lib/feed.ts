import { Feed } from "feed";

import { logo, site } from "@/config";
import { knex } from "@/lib/db";
import { languageEnum } from "@/lib/i18n/config";
import { Doctype, type Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";

const FEED_SIZE = Number(process.env.FEED_SIZE ?? "10");

export const feedEnum = {
  sitemap: "sitemap",
  rss: "rss",
  rss2: "rss2",
  atom: "atom",
  json: "json",
} as const;

export type FeedType = (typeof feedEnum)[keyof typeof feedEnum];

// enum의 값들을 문자열 목록으로 타입변환
export const frequencyEnum = {
  monthly: "monthly",
  yearly: "yearly",
  always: "always",
  hourly: "hourly",
  daily: "daily",
  weekly: "weekly",
  never: "never",
} as const;
export type Frequency = (typeof frequencyEnum)[keyof typeof frequencyEnum];

// TODO: i18n
const ko = languageEnum.ko;

const feed = new Feed({
  title: site.name,
  description: site.description,
  id: site.baseurl,
  link: site.baseurl,
  language: ko, // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  image: logo.light,
  favicon: `${site.baseurl}/favicon.ico`,
  copyright: `2025 ${site.copyrights} All rights reserved`,
  updated: new Date(),
  generator: "Next.js",
  feedLinks: {
    json: `${site.baseurl}/json`,
    atom: `${site.baseurl}/atom`,
    rss2: `${site.baseurl}/rss2`,
  },
  author: {
    name: "luasenvy",
    email: "luas.envy@gmail.com",
  },
});

export const feedColumns = {
  id: "id",
  title: "title",
  images: "images",
  created: "created",
  updated: "updated",
};

export async function getFeed() {
  const { id } = (await knex
    .select({ id: "o.id" })
    .from(
      knex
        .unionAll([
          knex.select({ id: "id", created: "created" }).from("document").whereNull("deleted"),
          knex.select({ id: "id", created: "created" }).from("post").whereNull("deleted"),
        ])
        .as("o"),
    )
    .orderBy("created", "desc")
    .first())!;

  // 최신 피드의 변경이 없다면 디비 검색 없이 메모리에 저장된 피드를 바로 응답
  if (feed.items[0]?.id === id) return feed;

  const rows: Array<
    DocumentType & { userName: User["name"]; email: User["email"]; type: Doctype }
  > = await knex
    .select({
      id: "o.id",
      title: "o.title",
      created: "o.created",
      userName: "u.name",
      email: "u.email",
    })
    .from(
      knex
        .unionAll([
          knex
            .select({
              ...feedColumns,
              type: knex.raw("?", [doctypeEnum.document]),
              userId: "userId",
            })
            .from("document")
            .whereNull("deleted"),
          knex
            .select({
              ...feedColumns,
              type: knex.raw("?", [doctypeEnum.post]),
              userId: "userId",
            })
            .from("post")
            .whereNull("deleted"),
        ])
        .as("o"),
    )
    .join({ u: "user" }, "o.userId", "u.id")
    .orderBy("created", "desc")
    .limit(FEED_SIZE);

  for (const { id, title, type, created, userName, email } of rows) {
    try {
      feed.addItem({
        id,
        title,
        link: `${site.baseurl}/${ko}/${type}?${new URLSearchParams({ id })}`,
        date: new Date(Number(created)),
        author: [{ name: userName, email }],
      });
    } catch (err) {
      console.error(err);
      continue;
    }
  }

  return feed;
}
