import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Container, Viewport } from "@/components/core/Container";
import { CategoryList } from "@/components/core/list/CategoryList";

import { pool } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { Category } from "@/lib/schema/category";
import { localePrefix } from "@/lib/url";

export default async function MyDocsPage(ctx: PageProps<"/[lng]/me/documents">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "사이트관리" },
    { title: "태그관리", href: `${lng}/site/tags` },
  ];

  const client = await pool.connect();
  try {
    const { rows } = await client.query<Category>(
      `SELECT id, description, created
         FROM category
     ORDER BY category ASC`,
    );

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Viewport>
          <Container as="div" variant="wide" className="space-y-2">
            <CategoryList rows={rows} />
          </Container>
        </Viewport>
      </>
    );
  } finally {
    client.release();
  }
}
