"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SiApple, SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Signin, signin } from "@/lib/schema/better-auth";

interface SigninFormProps {
  lng: Language;
  turnstileSiteKey: string;
}

export function SigninForm({ lng: lngParam, turnstileSiteKey }: SigninFormProps) {
  const lng = lngParam ? `/${lngParam}` : "";

  const callbackUrl = useSearchParams().get("callbackUrl") || "/";

  const { t } = useTranslation(lngParam);

  const [turnstileToken, setTurnstileToken] = useState<string>();

  const form = useForm<Signin>({
    resolver: zodResolver(signin),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmitSignin = async (values: Signin) => {
    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: new URL(callbackUrl, location.origin).toString(),
      // fetchOptions: {
      //   headers: {
      //     "x-captcha-response": turnstileToken,
      //     "x-captcha-user-remote-ip": userIp, // optional: forwards the user's IP address to the captcha service
      //   },
      // },
    });

    if (error) return toast.error(error.message);
  };

  const handleClickGithubSignin = async () => {
    if (!turnstileToken) return;

    const data = await signIn.social({
      provider: "github",
      fetchOptions: {
        headers: new Headers({ "x-captcha-response": turnstileToken + "notest" }),
      },
    });

    console.info(data);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Apple or Google account</CardDescription>
          <Turnstile siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitSignin)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" disabled={!turnstileToken}>
                    <SiApple />
                    Login with Apple
                  </Button>
                  <Button variant="outline" className="w-full" disabled={!turnstileToken}>
                    <SiGoogle />
                    Login with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClickGithubSignin}
                    disabled={!turnstileToken}
                  >
                    <SiGithub />
                    Login with GitHub
                  </Button>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                  <span className="relative z-10 bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field: { ref, ...field } }) => (
                        <FormItem>
                          <FormLabel>{t("Email")}</FormLabel>
                          <FormControl>
                            <Input
                              ref={(el) => {
                                el?.focus();
                                ref(el);
                              }}
                              type="email"
                              autoComplete="email"
                              placeholder="m@example.com"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              autoComplete="current-password"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href={`${lng}/signup`} className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
