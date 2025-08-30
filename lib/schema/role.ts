import z from "zod";
import { user } from "@/lib/schema/user";

export const roleEnum = {
  sysop: 99,
  admin: 30,
  user: 1,
  guest: 0,
} as const;

export type RoleEnum = (typeof roleEnum)[keyof typeof roleEnum];

export const role = z.object({
  email: user.shape.email,
  scope: z.enum(roleEnum),
});

export type Role = z.infer<typeof role>;
