import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Boxes } from "@/components/ui/shadcn-io/background-boxes";
import { cookieName } from "@/lib/i18n/config";
import { negotiate } from "@/lib/i18n/detect";
import { useTranslation } from "@/lib/i18n/next";

export default async function NotFound() {
  const language =
    (await cookies()).get(cookieName)?.value || (await headers()).get("accept-language");

  const lngParam = negotiate(language);

  const { t } = await useTranslation(lngParam);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-900">
      <Boxes className="absolute inset-0" />

      <div className="relative z-10 m-auto space-y-1">
        <h1 className="font-bold text-4xl text-rose-400">404 Not Found</h1>

        <p className="mb-6 text-muted-foreground">{t("Page does not exist")}</p>

        <Button className="!bg-white !text-black !shadow-xs hover:!bg-rose-200/90" asChild>
          <Link href="/">{t("move to home")}</Link>
        </Button>
      </div>
    </div>
  );
}
