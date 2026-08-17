import { z } from 'zod';
import { isoDateSchema } from '../common/dates.js';
import { objectIdSchema } from '../common/objectId.js';
import { transactionTypeSchema } from '../transaction/schemas.js';

export const recurringFrequencySchema = z.enum(['weekly', 'monthly']);

export const recurringTransactionSchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
  categoryId: objectIdSchema,
  amount: z.number().positive(),
  type: transactionTypeSchema,
  description: z.string().max(500).optional(),
  frequency: recurringFrequencySchema,
  nextDate: isoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;

export const createRecurringTransactionBodySchema = recurringTransactionSchema.pick({
  categoryId: true,
  amount: true,
  type: true,
  description: true,
  frequency: true,
  nextDate: true,
});
export type CreateRecurringTransactionBody = z.infer<typeof createRecurringTransactionBodySchema>;

export const savingsGoalSchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  targetDate: isoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

export const createSavingsGoalBodySchema = savingsGoalSchema.pick({
  name: true,
  targetAmount: true,
  targetDate: true,
});
export type CreateSavingsGoalBody = z.infer<typeof createSavingsGoalBodySchema>;

export const forecastQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(180).default(90),
});
export type ForecastQuery = z.infer<typeof forecastQuerySchema>;

export const forecastPointSchema = z.object({ date: isoDateSchema, balance: z.number() });
export const forecastAlertSchema = z.object({
  type: z.enum(['low_balance', 'goal_at_risk']),
  message: z.string(),
  date: isoDateSchema.optional(),
});
export const forecastGoalSchema = savingsGoalSchema
  .pick({ id: true, name: true, targetAmount: true, targetDate: true })
  .extend({ projectedBalance: z.number(), onTrack: z.boolean() });
export const forecastResponseSchema = z.object({
  startingBalance: z.number(),
  points: z.array(forecastPointSchema),
  alerts: z.array(forecastAlertSchema),
  goals: z.array(forecastGoalSchema),
});
export type ForecastResponse = z.infer<typeof forecastResponseSchema>;
