import { z } from "zod";

import { licenseEnum } from "@/lib/license";
import { user } from "@/lib/schema/user";

export const image = z.object({
  id: z.number(),
  tags: z.array(z.string()).optional(),
  path: z.string().max(200).optional(),
  name: z.string().max(150),
  userId: user.shape.id,
  size: z.number().min(1),
  width: z.number().min(1),
  height: z.number().min(1),
  uri: z.string().min(47).max(47),
  author: z.string().min(1),
  ref: z.string().optional(),
  license: z.nativeEnum(licenseEnum),
  created: z.number(),
  updated: z.number().optional(),
  deleted: z.number().optional(),

  // when to use join with user table
  userName: user.shape.name.optional(),
});

export type Image = z.infer<typeof image>;

export const imageForm = image.pick({
  tags: true,
  license: true,
});

export type ImageForm = z.infer<typeof imageForm>;

export const imageDescriptionForm = image.pick({
  license: true,
  author: true,
  ref: true,
});

export type ImageDescriptionForm = z.infer<typeof imageDescriptionForm>;
