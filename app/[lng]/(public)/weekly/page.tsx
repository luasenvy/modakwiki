import { Info } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import PrismaticBurst from "@/components/ui/react-bits/PrismaticBurst";
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
          <div className="relative h-[400px] border shadow-sm">
            <PrismaticBurst animationType="rotate3d" mixBlendMode="exclusion" />

            <div className="absolute inset-0 flex flex-col justify-between space-y-2">
              <div className="m-8 flex gap-1 overflow-y-hidden rounded-t-lg border shadow-sm md:overflow-x-hidden">
                {Boolean(one.images?.length) &&
                  one.images!.map((src, i) => (
                    <div
                      key={`top-img-${i}`}
                      role="img"
                      style={{ backgroundImage: `url('${src}')` }}
                      className="h-48 w-full bg-center bg-cover bg-no-repeat shadow-sm max-md:max-w-2/5 max-md:shrink-0"
                    />
                  ))}
              </div>

              <div className="bg-background/60 p-8 backdrop-blur-sm">
                <h2 className="truncate font-bold text-xl" title={one.title}>
                  <Link
                    href={`${lng}/${one.type}?${new URLSearchParams({ id: one.id })}`}
                    className="underline hover:text-blue-600"
                  >
                    {one.title}
                  </Link>
                </h2>
                <p className="truncate text-base text-muted-foreground">{one.description}</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-2xl">{t("Weekly Popular")}</h3>
          <div className="flex flex-nowrap gap-1 overflow-x-auto overflow-y-hidden pb-4">
            {others.map(({ id, type, title, images, userName }) =>
              Boolean(images?.length) ? (
                <div
                  key={`${type}-${id}`}
                  className="relative flex h-[200px] min-w-3xs max-w-xs overflow-hidden rounded-t-lg border bg-accent/80 bg-center bg-cover bg-no-repeat shadow-sm"
                  style={{ backgroundImage: `url('${images![0]}')` }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-background/80 p-4 backdrop-blur-sm">
                    <h4 className="truncate font-medium text-lg" title={title}>
                      <Link
                        href={`${lng}/${type}?${new URLSearchParams({ id })}`}
                        className="underline hover:text-blue-600"
                      >
                        {title}
                      </Link>
                    </h4>
                    <p className="m-0 truncate text-muted-foreground text-xs">{userName}</p>
                  </div>
                </div>
              ) : (
                <div
                  key={`${type}-${id}`}
                  className="relative h-[200px] min-w-3xs max-w-xs overflow-hidden rounded-t-lg border bg-accent/80 bg-center bg-cover bg-no-repeat shadow-sm"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-4 backdrop-blur-sm">
                    <h4 className="w-full truncate text-center font-medium text-lg" title={title}>
                      <Link
                        href={`${lng}/${type}?${new URLSearchParams({ id })}`}
                        className="underline hover:text-blue-600"
                      >
                        {title}
                      </Link>
                    </h4>
                    <p className="m-0 w-full truncate text-center text-muted-foreground text-xs">
                      {userName}
                    </p>
                  </div>
                </div>
              ),
            )}
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
