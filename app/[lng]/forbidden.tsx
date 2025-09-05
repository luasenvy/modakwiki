import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";
import { cookieName } from "@/lib/i18n/config";
import { negotiate } from "@/lib/i18n/detect";
import { useTranslation } from "@/lib/i18n/next";

export default async function Forbidden() {
  const language =
    (await cookies()).get(cookieName)?.value || (await headers()).get("accept-language");

  const lngParam = negotiate(language);

  const { t } = await useTranslation(lngParam);

  return (
    <div className="relative flex h-screen">
      <FlickeringGrid
        className="absolute inset-0"
        squareSize={24}
        gridGap={6}
        flickerChance={0.3}
        color="#00ff00"
        maxOpacity={0.2}
      />
      <div className="relative z-10 m-auto space-y-1">
        <h1 className="font-bold text-4xl text-rose-400">403 Forbidden</h1>

        <p className="mb-6 text-muted-foreground">
          {t("You do not have permission to access this page.")}
        </p>

        <Button asChild>
          <Link href="/">{t("move to home")}</Link>
        </Button>
      </div>
    </div>
  );
}
