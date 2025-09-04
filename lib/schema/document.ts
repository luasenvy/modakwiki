import z from "zod";
import { licenseEnum } from "@/lib/license";

export const doctypeEnum = {
  document: "w",
  essay: "e",
} as const;

export function getTablesByDoctype(doctype: Doctype) {
  const [table] = Object.entries(doctypeEnum).find(([, value]) => value === doctype) ?? [];
  if (!table) return {};

  return { table, history: `${table}_history` };
}

export type Doctype = (typeof doctypeEnum)[keyof typeof doctypeEnum];

export const document = z.object({
  id: z.string(),
  title: z.string().min(1).max(60),
  content: z.string().min(1),
  preview: z.string().max(120).optional(),
  view: z.number(),
  email: z.string().min(1),
  license: z.enum(licenseEnum).optional(),
  created: z.number(),
  updated: z.number(),
  deleted: z.number().optional(),
});

export type Document = z.infer<typeof document>;

export const documentForm = document
  .pick({
    title: true,
    content: true,
    license: true,
  })
  .extend({
    id: z.string().optional(),
    type: z.enum(doctypeEnum),
  });

export type DocumentForm = z.infer<typeof documentForm>;
