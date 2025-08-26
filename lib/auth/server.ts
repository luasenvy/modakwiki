import { betterAuth } from "better-auth";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";

export const auth = betterAuth({
  database,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      prompt: "select_account",
      ...authConfig.providers.google,
    },
    github: authConfig.providers.github,
  },
});

export type Session = typeof auth.$Infer.Session;
