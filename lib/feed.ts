import { Feed } from "feed";

import { logo, site } from "@/config";
import { pool } from "@/lib/db";
import { languageEnum } from "@/lib/i18n/config";
import { DIR, Sql } from "@/lib/sql";

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
  copyright: `2024 ${site.name} All rights reserved`,
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
    link: "https://www.luas.kr",
  },
});

export async function getFeed() {
  if (feed.items.length) return feed;

  const client = await pool.connect();
  try {
    const sql = new Sql(
      `    SELECT p.id
              , p.name
              , p.created
              , s.name as series_name
              , a.username
              , a.mail
              , a.href
           FROM post p
           JOIN author a
             ON p.author_id = a.username
     LEFT OUTER
           JOIN series s 
             ON p.series_id = s.id
          WHERE p.draft IS NOT TRUE
            AND p.deleted IS NULL
            AND s.deleted IS NULL`,
    );

    sql.orderby("created", DIR.DESC);
    sql.paginate(0, FEED_SIZE);

    return feed;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}
