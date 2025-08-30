import { Breadcrumb } from "@/components/core/Breadcrumb";
import Hero from "@/components/pages/welcome/Hero";
import { BreadcrumbItem } from "@/components/ui/sidebar";
import type { Language } from "@/lib/i18n/config";

export default async function WelcomePage(ctx: PageProps<"/[lng]">) {
  const lngParam = (await ctx.params).lng as Language;

  const breadcrumbs: Array<BreadcrumbItem> = [];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Hero lng={lngParam as Language} className="mx-auto" />
    </>
  );
}
