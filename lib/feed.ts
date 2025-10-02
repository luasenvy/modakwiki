import { Feed } from "feed";

import { logo, site } from "@/config";
import { knex } from "@/lib/db";
import { languageEnum } from "@/lib/i18n/config";
import { Doctype, type Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";

const FEED_SIZE = Number(process.env.FEED_SIZE ?? "10");

export const feedEnum = {
  rss: "rss",
  rss2: "rss2",
  atom: "atom",
  json: "json",
} as const;

// enum의 값들을 문자열 목록으로 타입변환
export type FeedType = (typeof feedEnum)[keyof typeof feedEnum];

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
  created: "created",
};

export async function getFeed() {
  const { count } = (await knex
    .sum({ count: "count" })
    .from(
      knex.unionAll([
        knex.count({ count: "*" }).from("document").whereNull("deleted"),
        knex.count({ count: "*" }).from("post").whereNull("deleted"),
      ]),
    )
    .first())!;
  console.info(count, "@@");

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
