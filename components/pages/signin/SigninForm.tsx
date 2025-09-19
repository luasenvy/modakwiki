"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { createAuthClient } from "better-auth/client";
import { notFound } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isDev } from "@/config";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface SigninFormProps {
  lng: Language;
  siteKey: string;
  referer?: string;
}

const authClient = createAuthClient();

export function SigninForm({ lng: lngParam, referer, siteKey }: SigninFormProps) {
  if (!isDev) return notFound();

  const { theme } = useTheme();
  const { t } = useTranslation(lngParam);

  const [token, setToken] = useState<string>();

  const handleClickGoogleSignin = useCallback(async () => {
    if (!token) return toast.error(t("Please verify you are human before signin"));

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: referer,
      fetchOptions: {
        headers: new Headers({ "x-captcha-response": token }),
      },
    });

    if (error) return toast.error(t(error.message!));
  }, [token, referer]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("Welcome back")}</CardTitle>
          <CardDescription>{t("Login with")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            {!token ? (
              <>
                <HCaptcha
                  sitekey={siteKey}
                  // for animate
                  onVerify={(token) => setTimeout(() => setToken(token), 1000)}
                  theme={theme}
                />
                <p className="font-semibold text-lg">
                  {t("Please verify you are human before signin")}
                </p>
              </>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleClickGoogleSignin}
                disabled={!token}
                aria-label={t("Sign in with Google")}
                title={
                  !token ? t("Please verify you are human before signin") : t("Sign in with Google")
                }
              >
                <SiGoogle />
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col border-t">
          <p className="mb-4 text-muted-foreground">사용 전 검토하세요</p>
          <div className="flex items-center justify-center">
            <a
              href="/privacy"
              className="text-blue-600 text-xs hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Privacy Policy")}
            </a>

            <Separator orientation="vertical" className="mx-2 w-px" />

            <a
              href="/terms"
              className="text-blue-600 text-xs hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("Terms of Service")}
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
