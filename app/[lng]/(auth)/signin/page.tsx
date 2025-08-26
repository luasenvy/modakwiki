import { GalleryVerticalEnd } from "lucide-react";
import { SigninForm } from "@/components/pages/signin/SigninForm";
import { betterAuth, isDev } from "@/config";
import { Language } from "@/lib/i18n/config";

export default async function SigninPage(ctx: PageProps<"/[lng]/signin">) {
  const { lng: lngParam } = await ctx.params;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>

        <SigninForm
          lng={lngParam as Language}
          dev={isDev}
          turnstileSiteKey={betterAuth.providers.cloudflare.turnstile.siteKey}
        />
      </div>
    </div>
  );
}
