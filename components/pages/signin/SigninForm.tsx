"use client";

import { SiGoogle } from "@icons-pack/react-simple-icons";
import { createAuthClient } from "better-auth/client";
import Link from "next/link";
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
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";

interface SigninFormProps {
  lng: Language;
  referer?: string;
}

const authClient = createAuthClient();

export function SigninForm({ lng: lngParam, referer }: SigninFormProps) {
  const { t } = useTranslation(lngParam);

  const handleClickGoogleSignin = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: referer,
    });

    if (error) return toast.error(error.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("Welcome back")}</CardTitle>
          <CardDescription>{t("Login with")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleClickGoogleSignin}
            >
              <SiGoogle />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col border-t">
          <p className="mb-4 text-muted-foreground">사용 전 검토하세요</p>
          <div className="flex items-center justify-center">
            <Link href="/privacy" className="text-blue-500 text-xs hover:underline">
              {t("Privacy Policy")}
            </Link>

            <Separator orientation="vertical" className="mx-2 w-px" />

            <Link href="/terms" className="text-blue-500 text-xs hover:underline">
              {t("Terms of Service")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
