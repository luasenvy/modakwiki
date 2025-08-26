import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";

export const auth = betterAuth({
  database,
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: authConfig.providers.github,
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: authConfig.providers.cloudflare.turnstile.secretKey,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
