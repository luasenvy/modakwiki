import z from "zod";
import { licenseEnum } from "@/lib/license";

export const doctypeEnum = {
  wkdoc: "w",
  essay: "e",
} as const;

export type Doctype = (typeof doctypeEnum)[keyof typeof doctypeEnum];

export const document = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  preview: z.string().max(120).optional(),
  type: z.enum(doctypeEnum),
  email: z.string().min(1),
  license: z.enum(licenseEnum).optional(),
  created: z.number(),
  updated: z.number(),
  deleted: z.number().optional(),
});

export type Document = z.infer<typeof document>;

export const documentForm = document
  .pick({
    type: true,
    title: true,
    content: true,
    license: true,
  })
  .extend({
    id: z.string().optional(),
  });

export type DocumentForm = z.infer<typeof documentForm>;
