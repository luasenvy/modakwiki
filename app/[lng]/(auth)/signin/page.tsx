import { GalleryVerticalEnd } from "lucide-react";
import { headers as nextHeaders } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { SigninForm } from "@/components/pages/signin/SigninForm";
import { betterAuth as authConfig, isDev, site } from "@/config";
import { auth } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";

export default async function SigninPage(ctx: PageProps<"/[lng]/signin">) {
  if (!isDev) return forbidden();

  const lngParam = (await ctx.params).lng as Language;

  const headers = await nextHeaders();
  const referer = headers.get("referer") || "/";

  const session = await auth.api.getSession({ headers });
  if (session) return redirect(referer);

  const { t } = await useTranslation(lngParam);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {t(site.name)}
        </a>

        <SigninForm
          lng={lngParam as Language}
          referer={referer}
          siteKey={authConfig.providers.hcaptcha.siteKey}
        />
      </div>
    </div>
  );
}
