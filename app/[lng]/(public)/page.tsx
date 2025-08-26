import Hero from "@/components/pages/welcome/Hero";
import type { Language } from "@/lib/i18n/config";

export default async function WelcomePage(ctx: PageProps<"/[lng]">) {
  const { lng: lngParam } = await ctx.params;

  try {
    return <Hero lng={lngParam as Language} />;
  } catch (err) {
    throw err;
  }
}
