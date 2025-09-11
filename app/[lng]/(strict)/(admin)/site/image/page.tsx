import { Info } from "lucide-react";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
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
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { pool } from "@/lib/db";
import { byteto } from "@/lib/format";
import type { Language } from "@/lib/i18n/config";
import { Image as ImageType } from "@/lib/schema/image";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "파일" },
    { title: "이미지", href: `${lng}/editor/syntax` },
  ];

  const client = await pool.connect();
  try {
    const {
      rows: [{ count }],
    } = await client.query<{ count: number }>(
      `SELECT COUNT(*) AS count
         FROM image
        WHERE deleted IS NULL`,
    );

    const { rows } = await client.query<ImageType>(
      `SELECT id
            , updated
            , deleted
            , created
            , license
            , uri
            , portrait
            , size
            , name
            , "userId"
         FROM image
        WHERE deleted IS NULL`,
    );

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Viewport>
          <Container as="div" variant="aside" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ id, uri, name, size }) => (
              <Card
                className="h-[400px] rounded-none hover:bg-accent sm:h-[300px]"
                key={`image-${id}`}
              >
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>
                    <p className="text-sm">{byteto(size)}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="size-full">
                  <ImageZoom
                    zoomMargin={40}
                    zoomImg={{ src: `/api/image${uri}` }}
                    className="relative size-full"
                  >
                    <Image src={`/api/image${uri}?q=t`} alt={name} fill />
                  </ImageZoom>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-2 py-1">
                  <ImageDeleteButton lng={lngParam} imageId={id} />
                </CardFooter>
              </Card>
            ))}
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
