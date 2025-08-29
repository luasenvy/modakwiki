"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SiApple, SiGoogle } from "@icons-pack/react-simple-icons";
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
import { signUp } from "@/lib/auth/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Signup, signup } from "@/lib/schema/better-auth";

interface SigninFormProps {
  lng: Language;
}

export function SignupForm({ lng: lngParam }: SigninFormProps) {
  const { t } = useTranslation(lngParam);

  const form = useForm<Signup>({
    resolver: zodResolver(signup),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (values: Signup) => {
    const { data, error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image: "https://example.com/image.png",
      callbackURL: new URL("/signin", location.origin).toString(),
    });

    if (error) return toast.error(error.message);

    console.info(data, error);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("Create an account")}</CardTitle>
        <CardDescription>{t("Sign up with social account")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <SiApple />
                  {t("Login with Apple")}
                </Button>
                <Button variant="outline" className="w-full">
                  <SiGoogle />
                  {t("Login with Google")}
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
                <span className="relative z-10 bg-card px-2 text-muted-foreground">
                  {t("Or continue with")}
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Name")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("This is your public display name")}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="m@example.com" required {...field} />
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
                          <Input type="password" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("Sign Up")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
