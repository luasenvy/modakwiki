import z from "zod";
import { licenseEnum } from "@/lib/license";
import { document } from "@/lib/schema/document";

export const history = document
  .pick({
    id: true,
    title: true,
    content: true,
    email: true,
    type: true,
    created: true,
  })
  .extend({
    added: z.number(),
    removed: z.number(),
  });

export type History = z.infer<typeof history>;
