"use client";

import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { createAuthClient } from "better-auth/client";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Language } from "@/lib/i18n/config";

interface SigninFormProps {
  lng: Language;
  turnstileSiteKey: string;
  referer?: string;
}

const authClient = createAuthClient();

export function SigninForm({ lng: lngParam, referer, turnstileSiteKey }: SigninFormProps) {
  const lng = lngParam ? `/${lngParam}` : "";

  const handleClickGoogleSignin = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: referer,
      scopes: ["https://www.googleapis.com/auth/userinfo.email"],
    });

    if (error) return toast.error(error.message);
  };

  const handleClickGithubSignin = async () => {
    const { error } = await authClient.signIn.social({ provider: "github" });

    if (error) return toast.error(error.message);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with</CardDescription>
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
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleClickGithubSignin}
            >
              <SiGithub />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
