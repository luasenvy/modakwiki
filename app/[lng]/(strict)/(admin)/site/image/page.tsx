import { Info } from "lucide-react";
import Image from "next/image";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { Pagination } from "@/components/core/Pagination";
import { ImageDeleteButton } from "@/components/pages/site/image/ImageDeleteButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { byteto, fromNow } from "@/lib/format";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { licenseImageEnum, licenseLinkEnum } from "@/lib/license";
import { Image as ImageType } from "@/lib/schema/image";
import { localePrefix } from "@/lib/url";

const pageSize = 6;
export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const lngParam = (await ctx.params).lng as Language;
  const searchParams = await ctx.searchParams;

  const page = Number(searchParams.page ?? "1");

  const lng = localePrefix(lngParam);

  const { count } = (await knex.count({ count: "*" }).from("image").whereNull("deleted").first())!;

  const counting = knex
    .count({ count: "*" })
    .from({ d: "document" })
    .whereNull("d.deleted")
    .andWhereRaw(knex.raw(`d.content ilike '%' || i.uri || '%'`));

  const rows: Array<ImageType & { usedCount: number }> = await knex
    .select({
      id: "i.id",
      updated: "i.updated",
      deleted: "i.deleted",
      created: "i.created",
      license: "i.license",
      uri: "i.uri",
      portrait: "i.portrait",
      size: "i.size",
      width: "i.width",
      height: "i.height",
      name: "i.name",
      author: "i.author",
      ref: "i.ref",
      userId: "i.userId",
      userName: "u.name",
      usedCount: knex
        .sum({ count: "o.count" })
        .from(knex.unionAll([counting, counting.clone().from({ d: "post" })]).as("o")),
    })
    .from({ i: "image" })
    .join({ u: "user" }, "u.id", "=", "i.userId")
    .whereNull("i.deleted")
    .orderBy("i.created", "desc")
    .offset((page - 1) * pageSize)
    .limit(pageSize);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: t("file") },
    { title: t("image"), href: `${lng}/editor/syntax` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(
            ({
              id,
              uri,
              name,
              width,
              height,
              size,
              license,
              author,
              ref,
              usedCount,
              userName,
              created,
            }) => (
              <Card className="!mb-0 gap-1 rounded-none hover:bg-accent" key={`image-${id}`}>
                <CardHeader>
                  <CardTitle className="truncate" title={name}>
                    {name}
                  </CardTitle>
                  <CardDescription>
                    <p className="text-sm">
                      {width}x{height}
                      <sub className="ml-1">( {byteto(size)} )</sub>
                    </p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageZoom zoomMargin={40} zoomImg={{ src: `/api/image${uri}` }}>
                    <div
                      aria-label={name}
                      role="img"
                      className="h-[400px] w-full border bg-center bg-cover bg-no-repeat shadow-sm sm:h-[150px]"
                      style={{ backgroundImage: `url('/api/image${uri}-t')` }}
                    />
                  </ImageZoom>

                  <div className="mt-3 space-y-3">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("copyrighter")}</span>
                        {ref ? (
                          <a
                            href={ref}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <span className="font-medium">{author}</span>
                          </a>
                        ) : (
                          <span className="font-medium">{author}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("license")}</span>
                        <a
                          href={licenseLinkEnum[license]}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <span className="font-medium">{t(license as string)}</span>
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("used")}</span>
                        <span className="font-medium">{usedCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("uploader")}</span>
                        <span className="font-medium">{userName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("license")}</span>
                        <a
                          href={licenseLinkEnum[license]}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <Image
                            alt={license}
                            src={licenseImageEnum[license]}
                            height={25}
                            width={71}
                          />
                        </a>
                      </div>
                    </div>
                    <div className="border-t pt-2 text-right text-muted-foreground text-xs">
                      {t("Created")}: {fromNow(Number(created), lngParam)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-2 py-1">
                  <ImageDeleteButton lng={lngParam} imageId={id} />
                </CardFooter>
              </Card>
            ),
          )}

          <Pagination
            className="mt-6 sm:col-span-2 lg:col-span-3"
            page={page}
            pageSize={pageSize}
            total={Number(count)}
            searchParams={searchParams}
          />
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">이미지 정보</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]">
            총 {count}개 이미지가 검색되었습니다.
          </div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
