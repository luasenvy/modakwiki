import { Info } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import ElectricBorder from "@/components/ui/react-bits/ElectricBorder";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { WEEK } from "@/lib/format";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { redis } from "@/lib/redis";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";

export async function generateMetadata(ctx: PageProps<"/[lng]/weekly">) {
  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  return {
    title: t("Weekly"),
    description: t("check this week's popular articles!"),
  };
}

const columns = {
  id: "id",
  title: "title",
  description: "description",
  images: "images",
  userId: "userId",
};

export default async function WeeklyPage(ctx: PageProps<"/[lng]/weekly">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("Weekly"), href: `${lng}/weekly` }];

  if (!redis.isOpen) await redis.connect();
  const keys = await redis.keys("ts:*:daily");

  const trx = redis.multi();
  const now = Date.now();
  for (const key of keys) trx.ts.range(key, now - WEEK, now);

  const top10 = (await trx.exec())
    .reduce<{ id: string; type: Doctype; value: number }[]>((acc, entries, i) => {
      const key = keys[i];
      return acc.concat({
        id: key.substring(5, key.lastIndexOf(":")),
        type: key.substring(3, 4) as Doctype,
        value: Object.values(entries).reduce<number>((acc, { value }) => acc + Number(value), 0),
      });
    }, [])
    .filter(({ id }) => !id.includes("__total__"))
    .toSorted(({ value: a }, { value: b }) => b - a)
    .slice(0, 6);

  const rows: Array<DocumentType & { userName: User["name"]; type: Doctype }> = await knex
    .select({
      id: "o.id",
      title: "o.title",
      type: "o.type",
      description: "o.description",
      images: "o.images",
      userName: "u.name",
    })
    .from(
      knex
        .unionAll([
          knex
            .select({
              ...columns,
              type: knex.raw(`'${doctypeEnum.document}'`),
            })
            .from("document")
            .whereIn(
              "id",
              top10.filter(({ type }) => doctypeEnum.document === type).map(({ id }) => id),
            ),
          knex
            .select({
              ...columns,
              type: knex.raw(`'${doctypeEnum.post}'`),
            })
            .from("post")
            .whereIn(
              "id",
              top10.filter(({ type }) => doctypeEnum.post === type).map(({ id }) => id),
            ),
        ])
        .as("o"),
    )
    .join({ u: "user" }, "u.id", "=", "o.userId");

  const [one, ...others] = rows;

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          <h2 className="font-bold text-3xl">{t("Weekly Best")}</h2>
          <ElectricBorder
            color="var(--primary)"
            speed={1}
            chaos={0.5}
            thickness={2}
            className="rounded-xl"
          >
            <div className="space-y-2 p-8">
              <div className="flex gap-1 overflow-hidden">
                {one.images?.map((src, i) => (
                  <div
                    key={`images-${i}`}
                    role="img"
                    style={{ backgroundImage: `url('${src}')` }}
                    className="h-48 w-full bg-center bg-cover bg-no-repeat"
                  />
                ))}
              </div>
              <h2 className="font-bold text-xl">
                <Link
                  href={`${lng}/${one.type}?${new URLSearchParams({ id: one.id })}`}
                  className="underline hover:text-blue-600"
                >
                  {one.title}
                </Link>
              </h2>
              <p className="text-base text-muted-foreground">{one.description}</p>
            </div>
          </ElectricBorder>

          <h3 className="font-semibold text-2xl">{t("Weekly Popular")}</h3>
          <div className="flex flex-nowrap gap-1 overflow-x-auto overflow-y-hidden">
            {others.map(({ id, type, title, images, userName }) => (
              <div
                key={`${type}-${id}`}
                className="mb-4 flex h-[200px] w-xs flex-col justify-end rounded-lg bg-center bg-cover bg-muted bg-no-repeat last:mb-0"
                style={{ backgroundImage: images?.[0] ? `url('${images[0]}')` : undefined }}
              >
                <div className="bg-background/80 p-4 backdrop-blur-lg">
                  <h4 className="truncate font-medium text-lg">
                    <Link
                      href={`${lng}/${type}?${new URLSearchParams({ id })}`}
                      className="underline hover:text-blue-600"
                    >
                      {title}
                    </Link>
                  </h4>
                  <p className="m-0 text-muted-foreground text-sm">{userName}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">{t("search results")}</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]"></div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
