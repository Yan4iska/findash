import { z } from "zod";
import { isoDateSchema } from "../common/dates.js";
import { objectIdSchema } from "../common/objectId.js";

export const analyticsGranularitySchema = z.enum(["day", "week", "month"]);

export type AnalyticsGranularity = z.infer<typeof analyticsGranularitySchema>;

export const analyticsPeriodQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  granularity: analyticsGranularitySchema.optional(),
});

export type AnalyticsPeriodQuery = z.infer<typeof analyticsPeriodQuerySchema>;

export const analyticsSummarySchema = z.object({
  totalIncome: z.number().min(0),
  totalExpense: z.number().min(0),
  net: z.number(),
  transactionCount: z.number().int().min(0),
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;

export const categoryBreakdownItemSchema = z.object({
  categoryId: objectIdSchema,
  categoryName: z.string(),
  total: z.number(),
  percentage: z.number().min(0).max(100),
});

export type CategoryBreakdownItem = z.infer<typeof categoryBreakdownItemSchema>;

export const trendPointSchema = z.object({
  date: isoDateSchema,
  income: z.number().min(0),
  expense: z.number().min(0),
  net: z.number(),
});

export type TrendPoint = z.infer<typeof trendPointSchema>;
