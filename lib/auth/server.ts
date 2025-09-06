import { betterAuth } from "better-auth";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";
import { scopeEnum, user } from "@/lib/schema/user";

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
      scope: {
        type: "number",
        validator: {
          input: user.shape.scope,
          output: user.shape.scope,
        },
      },
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
});

export type Session = typeof auth.$Infer.Session;
