import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";
import { scopeEnum } from "@/lib/schema/user";

export const auth = betterAuth({
  database,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const client = await database.connect();
          try {
            const { rowCount } = await client.query(
              `SELECT COUNT(*)
                 FROM user
                WHERE email = $1`,
              [user.email],
            );

            if (rowCount) throw new APIError("CONFLICT", { message: "Email already exists." });

            return {
              data: {
                ...user,
                scope: scopeEnum.associate,
              },
            };
          } finally {
            client.release();
          }
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
