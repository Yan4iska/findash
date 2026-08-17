import { z } from "zod";
import { isoDateSchema } from "../common/dates.js";
import { objectIdSchema } from "../common/objectId.js";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color");

export const categorySchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
  name: z.string().min(1).max(100),
  color: hexColorSchema,
  icon: z.string().min(1).max(50).optional(),
  sortOrder: z.number().int().min(0),
  createdAt: isoDateSchema,
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryBodySchema = z.object({
  name: z.string().min(1).max(100),
  color: hexColorSchema.optional(),
  icon: z.string().min(1).max(50).optional(),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    color: hexColorSchema.optional(),
    icon: z.string().min(1).max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

export const reorderCategoriesBodySchema = z.object({
  orderedIds: z.array(objectIdSchema).min(1),
});

export type ReorderCategoriesBody = z.infer<
  typeof reorderCategoriesBodySchema
>;
