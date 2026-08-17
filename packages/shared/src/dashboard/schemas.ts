import { z } from "zod";

export const widgetTypeSchema = z.enum([
  "summary",
  "categoryPie",
  "trendChart",
  "recentTransactions",
]);

export type WidgetType = z.infer<typeof widgetTypeSchema>;

export const widgetGridSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
});

export type WidgetGrid = z.infer<typeof widgetGridSchema>;

export const widgetConfigSchema = z.object({
  id: z.string().min(1),
  type: widgetTypeSchema,
  title: z.string().max(100).optional(),
  grid: widgetGridSchema,
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

export const dashboardLayoutSchema = z.object({
  widgets: z.array(widgetConfigSchema),
});

export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
