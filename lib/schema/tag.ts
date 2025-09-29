import z from "zod";
import { category } from "@/lib/schema/category";

export const tag = z.object({
  id: z.string().min(1).max(30),
  category: category.shape.id,
});

export type Tag = z.infer<typeof tag>;

export const tagForm = tag
  .pick({
    id: true,
    category: true,
  })
  .extend({
    name: z.string().min(1).max(30),
    type: z.string().min(1).max(1),
  });

export type TagForm = z.infer<typeof tagForm>;
