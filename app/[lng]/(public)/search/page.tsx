import { Info } from "lucide-react";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Advertisement } from "@/components/core/button/Advertisement";
import { Container, Viewport } from "@/components/core/Container";
import { DocumentFilter } from "@/components/core/DocumentFilter";
import { DocumentList } from "@/components/core/list/DocumentList";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { Doctype, doctypeEnum } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

const pageSize = 10;
export default async function RecentPage(ctx: PageProps<"/[lng]/recent">) {
  const searchParams = await ctx.searchParams;

  const type = (searchParams.type || doctypeEnum.document) as Doctype;
  const page = Number(searchParams.page ?? "1");
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  let tags = searchParams.tags || [];

  if (!Array.isArray(tags)) tags = [tags].filter(Boolean);

  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const { t } = await useTranslation(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t("popular"), href: `${lng}/popular` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Viewport>
        <Container as="div" variant="aside">
          <DocumentFilter lng={lngParam} searchParams={searchParams} type={type} />
          <DocumentList
            lng={lngParam}
            searchParams={searchParams}
            doctype={type}
            search={search}
            category={category}
            tags={tags}
            pagination={{ page, pageSize }}
          />
        </Container>

        <div className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden">
          <div className="mb-2 flex items-center gap-2">
            <Info className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">검색결과</p>
          </div>

          <div className="relative ms-px min-h-0 overflow-auto py-3 text-sm [scrollbar-width:none]"></div>

          <Advertisement className="py-6" />
        </div>
      </Viewport>
    </>
  );
}
