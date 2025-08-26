import type { MetadataRoute } from "next";

import { site } from "@/config";
import { pool } from "@/lib/db";
import { languageEnum } from "@/lib/i18n/config";
import { DIR, Sql } from "@/lib/sql";

type Frequncy = "monthly" | "yearly" | "always" | "hourly" | "daily" | "weekly" | "never";

const started = new Date();
const changeFrequency: Frequncy = "monthly";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = await pool.connect();

  try {
    const sql = new Sql(
      `SELECT id
            , created
            , updated
         FROM post
        WHERE draft IS NOT TRUE
          AND deleted IS NULL`,
    );

    sql.orderby("created", DIR.ASC);

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
        url: `${site.baseurl}/${ko}/series`,
        changeFrequency,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${ko}/team`,
        changeFrequency,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${ko}/promotion/travel-map`,
        changeFrequency,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${ko}/promotion/senior`,
        changeFrequency,
        priority: 0.6,
        lastModified: started,
      },
      {
        url: `${site.baseurl}/${ko}/photobook`,
        changeFrequency,
        priority: 0.6,
        lastModified: started,
      },
    ];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}
