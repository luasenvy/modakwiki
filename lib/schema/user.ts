import z from "zod";

export const scopeEnum = {
  sysop: 99,
  admin: 30,
  editor: 10,
  member: 1,
  associate: 0,
} as const;

export type ScopeEnum = (typeof scopeEnum)[keyof typeof scopeEnum];

export const user = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional(),
  scope: z.nativeEnum(scopeEnum),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof user>;
