import { betterAuth } from "better-auth";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";
import { scopeEnum } from "@/lib/schema/user";

export const auth = betterAuth({
  database,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              scope: scopeEnum.associate,
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      scope: { type: "number" },
    },
  },
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
