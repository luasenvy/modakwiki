import { createAuthClient } from "better-auth/react";
import { betterAuth } from "@/config";

export const authClient = createAuthClient({
  baseURL: betterAuth.baseurl,
});

export const { signIn, signUp, signOut, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;
