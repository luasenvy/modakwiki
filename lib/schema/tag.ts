import z from "zod";

export const tag = z.object({
  category: z.string().max(30),
  tags: z.array(z.string()).optional(),
});

export type Tag = z.infer<typeof tag>;

export const tagForm = tag.pick({
  category: true,
  tags: true,
});

export type TagForm = z.infer<typeof tagForm>;
