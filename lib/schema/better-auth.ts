import z from "zod";

export const signin = z.object({
  email: z.string(),
  password: z.string(),
});

export type Signin = z.infer<typeof signin>;

export const signup = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export type Signup = z.infer<typeof signup>;
