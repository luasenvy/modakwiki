import z from "zod";
import { document } from "@/lib/schema/document";

export const history = document
  .pick({
    title: true,
    content: true,
    description: true,
    userId: true,
    license: true,
    category: true,
    tags: true,
    created: true,
  })
  .extend({
    docId: document.shape.id,
    added: z.number(),
    removed: z.number(),
  });

export type History = z.infer<typeof history>;
