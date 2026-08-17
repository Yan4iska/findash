import type {
  AnalyticsPeriodQuery,
  AnalyticsSummary,
  CategoryBreakdownItem,
  TrendPoint,
} from "@findash/shared";
import { apiClient } from "./client.js";

export async function fetchAnalyticsSummary(
  query: AnalyticsPeriodQuery,
): Promise<AnalyticsSummary> {
  const { data } = await apiClient.get<AnalyticsSummary>(
    "/analytics/summary",
    { params: query },
  );
  return data;
}

export async function fetchCategoryBreakdown(
  query: AnalyticsPeriodQuery,
): Promise<CategoryBreakdownItem[]> {
  const { data } = await apiClient.get<CategoryBreakdownItem[]>(
    "/analytics/category-breakdown",
    { params: query },
  );
  return data;
}

export async function fetchTrend(
  query: AnalyticsPeriodQuery,
): Promise<TrendPoint[]> {
  const { data } = await apiClient.get<TrendPoint[]>("/analytics/trend", {
    params: query,
  });
  return data;
}
