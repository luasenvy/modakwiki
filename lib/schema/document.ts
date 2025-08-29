import z from "zod";

export const document = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  email: z.string().min(1),
});

export type Document = z.infer<typeof document>;

export const documentForm = document.pick({
  title: true,
  content: true,
});

export type DocumentForm = z.infer<typeof documentForm>;
