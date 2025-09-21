import { Info } from "lucide-react";
import Image from "next/image";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { ImageDeleteButton } from "@/components/pages/site/image/ImageDeleteButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { pool } from "@/lib/db";
import { byteto, fromNow } from "@/lib/format";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { licenseImageEnum, licenseLinkEnum } from "@/lib/license";
import { Image as ImageType } from "@/lib/schema/image";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const client = await pool.connect();
  try {
    const {
      rows: [{ count }],
    } = await client.query<{ count: number }>(
      `SELECT COUNT(*) AS count
         FROM image
        WHERE deleted IS NULL`,
    );

    const { rows } = await client.query<ImageType & { usedCount: number }>(
      `SELECT i.id
            , i.updated
            , i.deleted
            , i.created
            , i.license
            , i.uri
            , i.portrait
            , i.size
            , i.width
            , i.height
            , i.name
            , i.author
            , i.ref
            , i."userId"
            , u.name AS "userName"
            , (
                SELECT SUM(u.count) as count
                FROM (
                     SELECT COUNT(*) as count
                       FROM essay e
                      WHERE e.deleted IS NULL
                        AND e.content LIKE '%' || i.uri || '%'
                     UNION ALL
                     SELECT COUNT(*) as count
                       FROM document d
                      WHERE d.deleted IS NULL
                        AND d.content LIKE '%' || i.uri || '%'
                ) as u
              ) AS "usedCount"
         FROM image i
         JOIN "user" u
           ON u.id = i."userId"
        WHERE i.deleted IS NULL
     ORDER BY i.created DESC`,
    );

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
                        {t("Created")}: {fromNow(created)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end gap-2 py-1">
                    <ImageDeleteButton lng={lngParam} imageId={id} />
                  </CardFooter>
                </Card>
              ),
            )}
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
  } finally {
    client.release();
  }
}
