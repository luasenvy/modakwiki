import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Container } from "@/components/core/Container";
import { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "내 정보", href: `${lng}/me` },
    { title: "문서함", href: `${lng}/me/documents` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Container className="lg:max-w-3xl xl:max-w-4xl">
        <p>Docs</p>
      </Container>
    </>
  );
}
