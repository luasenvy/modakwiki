import z from "zod";
import { licenseEnum } from "@/lib/license";

export const doctypeEnum = {
  wkdoc: "wkdoc",
  essay: "essay",
} as const;

export type Doctype = z.infer<typeof doctypeEnum>;

export const document = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  type: z.enum(doctypeEnum),
  email: z.string().min(1),
  license: z.enum(licenseEnum).optional(),
});

export type Document = z.infer<typeof document>;

export const documentForm = document.pick({
  type: true,
  title: true,
  content: true,
  license: true,
});

export type DocumentForm = z.infer<typeof documentForm>;
