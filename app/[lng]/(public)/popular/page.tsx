import { Info } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import PrismaticBurst from "@/components/ui/react-bits/PrismaticBurst";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { redis } from "@/lib/redis";
import { Doctype, Document as DocumentType, doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";
import { WEEK } from "@/lib/time";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

export async function generateMetadata(ctx: PageProps<"/[lng]/popular">) {
  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  return {
    title: t("Popular"),
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

export default async function PopularPage(ctx: PageProps<"/[lng]/popular">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("Popular"), href: `${lng}/popular` }];

  if (!redis.isOpen) await redis.connect();
  // redis.keys may return buffers when certain client options are set.
  // Normalize to UTF-8 strings to avoid corrupted non-ASCII characters.
  const keys = (await redis.keys("ts:*:daily")).map((k) => k.toString("utf8"));

  const trx = redis.multi();
  const now = Date.now();

  for (const key of keys) trx.ts.range(key, now - WEEK, now);

  const top6 = (await trx.exec())
    .map((entries) => Object.values(entries))
    .map((values) =>
      values.length > 1 ? Number(values.at(-1)!.value) - Number(values[0].value) : 0,
    )
    .map((value, i) => ({
      id: keys[i].substring(5, keys[i].lastIndexOf(":")),
      type: keys[i].substring(3, 4) as Doctype,
      value,
    }))
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
              top6.filter(({ type }) => doctypeEnum.document === type).map(({ id }) => id),
            ),
          knex
            .select({
              ...columns,
              type: knex.raw(`'${doctypeEnum.post}'`),
            })
            .from("post")
            .whereIn(
              "id",
              top6.filter(({ type }) => doctypeEnum.post === type).map(({ id }) => id),
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

            <div className="absolute inset-0 flex flex-col justify-between space-y-2 overflow-hidden">
              <div className="m-8 flex gap-1 overflow-y-hidden pb-4 md:overflow-x-hidden">
                {Boolean(one.images?.length) &&
                  one.images!.map((src, i) => (
                    <div
                      key={`top-img-${i}`}
                      role="img"
                      style={{ backgroundImage: `url('/api/image${src}')` }}
                      className="h-48 w-full rounded-lg bg-accent/60 bg-center bg-cover bg-no-repeat shadow-sm backdrop-blur-sm max-md:max-w-2/5 max-md:shrink-0"
                    />
                  ))}
              </div>

              <div className="m-0 bg-background/60 p-8 backdrop-blur-sm">
                <h2 className="truncate font-bold text-xl" title={one.title}>
                  <Link
                    href={`${lng}/${one.type}?${new URLSearchParams({ id: one.id })}`}
                    className="underline hover:text-blue-600 dark:hover:text-blue-500"
                  >
                    {one.title}
                  </Link>
                </h2>
                <p className="truncate text-base text-muted-foreground">{one.description}</p>
              </div>

              <Ribbon size="lg">
                {Math.trunc(top6.find(({ id }) => id === one.id)?.value ?? 0)} {t("View")}
              </Ribbon>
            </div>
          </div>

          <h3 className="font-semibold text-2xl">{t("Weekly Popular")}</h3>
          <div className="flex flex-nowrap gap-1 overflow-x-auto overflow-y-hidden pb-4">
            {others.map(({ id, type, title, images, userName }) =>
              Boolean(images?.length) ? (
                <div
                  key={`${type}-${id}`}
                  className="relative flex h-[200px] min-w-3xs max-w-xs overflow-hidden rounded-t-lg border bg-accent/80 bg-center bg-cover bg-no-repeat shadow-sm"
                  style={{ backgroundImage: `url('/api/image${images![0]}')` }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-background/80 p-4 backdrop-blur-sm">
                    <h4 className="truncate font-medium text-lg" title={title}>
                      <Link
                        href={`${lng}/${type}?${new URLSearchParams({ id })}`}
                        className="underline hover:text-blue-600 dark:hover:text-blue-500"
                      >
                        {title}
                      </Link>
                    </h4>
                    <p className="m-0 truncate text-muted-foreground text-xs">{userName}</p>
                  </div>

                  <Ribbon size="sm">
                    {Math.trunc(top6.find(({ id }) => id === one.id)?.value ?? 0)} {t("View")}
                  </Ribbon>
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
                        className="underline hover:text-blue-600 dark:hover:text-blue-500"
                      >
                        {title}
                      </Link>
                    </h4>
                    <p className="m-0 w-full truncate text-center text-muted-foreground text-xs">
                      {userName}
                    </p>
                  </div>

                  <Ribbon size="sm">
                    {Math.trunc(top6.find(({ id }) => id === one.id)?.value ?? 0)} {t("View")}
                  </Ribbon>
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

interface RibbonProps extends React.PropsWithChildren {
  size?: "sm" | "md" | "lg";
}

const variants = {
  sm: "top-8 right-8 h-8 w-32",
  md: "top-10 right-10 h-10 w-48",
  lg: "top-12 right-12 h-12 w-64",
};

function Ribbon({ size = "sm", children }: RibbonProps) {
  return (
    <div
      className={cn(
        "-translate-y-1/2 absolute flex translate-x-1/2 rotate-45 bg-destructive/85",
        variants[size],
      )}
    >
      <p
        className={cn("m-auto font-bold text-destructive-foreground", {
          "text-xl": size === "lg",
          "text-lg": size === "md",
          "text-base": size === "sm",
        })}
      >
        {children}
      </p>
    </div>
  );
}
