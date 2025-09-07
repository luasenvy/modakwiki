import z from "zod";
import { document } from "@/lib/schema/document";

export const history = document
  .pick({
    id: true,
    title: true,
    content: true,
    description: true,
    email: true,
    type: true,
    category: true,
    tags: true,
    created: true,
  })
  .extend({
    added: z.number(),
    removed: z.number(),
  });

export type History = z.infer<typeof history>;
