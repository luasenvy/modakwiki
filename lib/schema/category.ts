import z from "zod";

export const category = z.object({
  id: z.string().min(1).max(30),
  description: z.string().max(120).optional(),
});

export type Category = z.infer<typeof category>;

export const categoryForm = category
  .pick({
    id: true,
    description: true,
  })
  .extend({
    name: z.string().min(1).max(30),
  });

export type CategoryForm = z.infer<typeof categoryForm>;
