import z from "zod";

export const series = z.object({
  id: z.string(),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(120).optional(),
  cover: z.string().min(1).optional(),
  created: z.number(),
  deleted: z.number().optional(),
});

export type Series = z.infer<typeof series>;

export const page = z.object({
  id: z.string(),
  docId: z.string(),
  order: z.number(),
});

export type Page = z.infer<typeof page>;
