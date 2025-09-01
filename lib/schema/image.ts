import { z } from "zod";

import { licenseEnum } from "@/lib/license";

export const image = z.object({
  id: z.number(),
  tags: z.array(z.string()).optional(),
  path: z.string().max(200).optional(),
  name: z.string().max(150),
  size: z.number(),
  license: z.enum(licenseEnum).optional(),
  created: z.number(),
  updated: z.number().optional(),
  deleted: z.number().optional(),
});

export type Image = z.infer<typeof image>;

export const imageForm = image
  .pick({
    content: true,
    tags: true,
    license: true,
  })
  .extend(
    z.object({
      id: z.number().optional(),
      cover: z.custom<FileList>().optional(), // filename for input
    }),
  );

export type ImageForm = z.infer<typeof imageForm>;
