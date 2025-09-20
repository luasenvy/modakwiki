import { betterAuth } from "better-auth";
import { captcha, oneTap } from "better-auth/plugins";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";
import { scopeEnum } from "@/lib/schema/user";

export const auth = betterAuth({
  database,
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          return {
            data: { ...user, scope: scopeEnum.associate },
          };
        },
      },
    },
  },
  account: {
    accountLinking: { enabled: true },
  },
  user: {
    additionalFields: {
      scope: { type: "number" },
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 10 * 60 },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      ...authConfig.providers.google,
    },
  },
  plugins: [
    captcha({
      provider: "hcaptcha",
      secretKey: authConfig.providers.hcaptcha.secretKey,
      endpoints: ["/api/auth/hcaptcha"],
    }),
    oneTap(),
  ],
});

export type Session = typeof auth.$Infer.Session;

const hcaptchaSecret = authConfig.providers.hcaptcha.secretKey;
export async function verifyHCaptcha(token?: string | null) {
  try {
    if (!token) return { success: false, message: "missing_token", status: 400 };

    const params = new URLSearchParams();
    params.append("secret", hcaptchaSecret);
    params.append("response", token);

    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    if (!data?.success)
      return { success: false, message: data["error-codes"] ?? data, status: 401 };

    return { success: true };
  } catch {
    return { success: false, status: 500 };
  }
}
