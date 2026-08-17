import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_TYPES,
} from "../common/constants.js";
import { isoDateSchema } from "../common/dates.js";
import { objectIdSchema } from "../common/objectId.js";

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES);

export const transactionSchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
  categoryId: objectIdSchema,
  amount: z.number().positive(),
  type: transactionTypeSchema,
  description: z.string().max(500).optional(),
  date: isoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export type Transaction = z.infer<typeof transactionSchema>;

export const createTransactionBodySchema = z.object({
  categoryId: objectIdSchema,
  amount: z.number().positive(),
  type: transactionTypeSchema,
  description: z.string().max(500).optional(),
  date: isoDateSchema,
});

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>;

export const updateTransactionBodySchema = z
  .object({
    categoryId: objectIdSchema.optional(),
    amount: z.number().positive().optional(),
    type: transactionTypeSchema.optional(),
    description: z.string().max(500).optional(),
    date: isoDateSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateTransactionBody = z.infer<typeof updateTransactionBodySchema>;

export const transactionFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  categoryId: objectIdSchema.optional(),
  type: transactionTypeSchema.optional(),
  search: z.string().max(200).optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
