import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { isDev } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import { knex } from "@/lib/db";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { doctypeEnum } from "@/lib/schema/document";
import { localePrefix } from "@/lib/url";

export async function generateMetadata(ctx: PageProps<"/[lng]/random">) {
  const lngParam = (await ctx.params).lng as Language;
  const { t } = await useTranslation(lngParam);

  return {
    title: t("Random"),
    description: t("Go to a random document."),
  };
}

export default async function WikiDocPage(ctx: PageProps<"/[lng]/random">) {
  const params = await ctx.params;

  const lngParam = params.lng as Language;
  const lng = localePrefix(lngParam);

  const doc = await knex
    .select(["id", "type"])
    .from(
      knex.unionAll([
        knex
          .select({
            id: "id",
            type: knex.raw(`'${doctypeEnum.document}'`),
          })
          .from("document"),
        knex
          .select({
            id: "id",
            type: knex.raw(`'${doctypeEnum.post}'`),
          })
          .from("post"),
      ]),
    )
    .orderByRaw("random()")
    .limit(1)
    .first();

  if (!doc) {
    const { t } = await useTranslation(lngParam);
    const content = isDev
      ? `[${t("Please register the first document!")}](${lng}/editor/write)`
      : "";

    const title = t("There is no any document.");
    const breadcrumbs: Array<BreadcrumbItem> = [{ title, href: `${lng}/w/random` }];

    return (
      <>
        <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
        <Document lng={lngParam} title={title} content={content.trim()} />
      </>
    );
  }

  return redirect(`${lng}/${doc.type}?${new URLSearchParams({ id: doc.id })}`);
}
