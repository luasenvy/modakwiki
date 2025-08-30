import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { betterAuth as authConfig } from "@/config";
import { pool as database } from "@/lib/db";
import { Role } from "@/lib/schema/role";

export const auth = betterAuth({
  database,
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
  plugins: [
    customSession(async ({ user, session }) => {
      const client = await database.connect();

      try {
        const {
          rows: [role],
        } = await client.query<Pick<Role, "scope">>(
          `SELECT scope
             FROM role
            WHERE email = $1`,
          [user.email],
        );

        if (!role) throw new Error("Role not found");

        return {
          user: { ...user, scope: role.scope },
          session,
        };
      } finally {
        client.release();
      }
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
