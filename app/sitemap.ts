import type { MetadataRoute } from "next";

import { site } from "@/config";
import { knex } from "@/lib/db";
import { feedColumns } from "@/lib/feed";
import { languageEnum } from "@/lib/i18n/config";
import { doctypeEnum } from "@/lib/schema/document";

type Frequncy = "monthly" | "yearly" | "always" | "hourly" | "daily" | "weekly" | "never";

const started = new Date();
const changeFrequency: Frequncy = "monthly";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await knex
    .select({
      id: "o.id",
      type: "o.type",
      created: "o.created",
      updated: "o.updated",
    })
    .from(
      knex
        .unionAll([
          knex
            .select({
              ...feedColumns,
              type: knex.raw("?", [doctypeEnum.document]),
            })
            .from("document")
            .whereNull("deleted"),
          knex
            .select({
              ...feedColumns,
              type: knex.raw("?", [doctypeEnum.post]),
            })
            .from("post")
            .whereNull("deleted"),
        ])
        .as("o"),
    )
    .orderBy("created", "asc");

  // TODO: i18n
  const ko = languageEnum.ko;
  return [
    {
      url: site.baseurl as string,
      lastModified: started,
      changeFrequency,
      priority: 1,
    },
    {
      url: `${site.baseurl}/${ko}/what-is-this`,
      changeFrequency,
      priority: 0.6,
      lastModified: started,
    },
    {
      url: `${site.baseurl}/${ko}/random`,
      changeFrequency,
      priority: 0.6,
      lastModified: started,
    },
    {
      url: `${site.baseurl}/${ko}/popular`,
      changeFrequency,
      priority: 0.6,
      lastModified: started,
    },
    {
      url: `${site.baseurl}/${ko}/list`,
      changeFrequency,
      priority: 0.6,
      lastModified: started,
    },
    {
      url: `${site.baseurl}/${ko}/series`,
      changeFrequency,
      priority: 0.6,
      lastModified: started,
    },
    ...rows.map(({ id, type, created, updated }) => {
      return {
        url: `${site.baseurl}/${ko}/${type}?${new URLSearchParams({ id })}`,
        changeFrequency,
        priority: 0.6,
        lastModified:
          updated && created !== updated ? new Date(Number(updated)) : new Date(Number(created)),
      };
    }),
  ];
}
