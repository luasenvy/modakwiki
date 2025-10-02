import z from "zod";
import { licenseEnum } from "@/lib/license";
import { category } from "@/lib/schema/category";
import { tag } from "@/lib/schema/tag";

export const doctypeEnum = {
  document: "d",
  post: "p",
  user: "u",
} as const;

export function getTablesByDoctype(doctype: Doctype) {
  const [table] = Object.entries(doctypeEnum).find(([, value]) => value === doctype) ?? [];
  if (!table) return {};

  return {
    table,
    history: `${table}_history`,
    category: `${table}_category`,
    tag: `${table}_tag`,
    series: `${table}_series`,
    seriesMap: `${table}_series_map`,
  };
}

export type Doctype = (typeof doctypeEnum)[keyof typeof doctypeEnum];

export const document = z.object({
  id: z.string(),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(120).optional(),
  content: z.string().min(1),
  preview: z.string().max(120).optional(),
  category: category.shape.id,
  tags: z.array(tag.shape.id).optional(),
  images: z.array(z.string().min(1)).optional(),
  view: z.number(),
  userId: z.string().min(1),
  license: z.nativeEnum(licenseEnum).optional(),
  created: z.number(),
  updated: z.number(),
  deleted: z.number().optional(),
});

export type Document = z.infer<typeof document>;

export const documentForm = document
  .pick({
    title: true,
    description: true,
    content: true,
    license: true,
    category: true,
    tags: true,
  })
  .extend({
    id: z.string().optional(),
    type: z.nativeEnum(doctypeEnum),
  });

export type DocumentForm = z.infer<typeof documentForm>;
