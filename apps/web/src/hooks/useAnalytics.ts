import { useQuery } from "@tanstack/react-query";
import type { AnalyticsPeriodQuery } from "@findash/shared";
import {
  fetchAnalyticsSummary,
  fetchCategoryBreakdown,
  fetchTrend,
} from "../api/analytics.js";
import { queryKeys } from "./queryKeys.js";

export function useAnalyticsSummary(query: AnalyticsPeriodQuery) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(query),
    queryFn: () => fetchAnalyticsSummary(query),
    enabled: !!query.startDate && !!query.endDate,
  });
}

export function useCategoryBreakdown(query: AnalyticsPeriodQuery) {
  return useQuery({
    queryKey: queryKeys.analytics.breakdown(query),
    queryFn: () => fetchCategoryBreakdown(query),
    enabled: !!query.startDate && !!query.endDate,
  });
}

export function useTrend(query: AnalyticsPeriodQuery) {
  return useQuery({
    queryKey: queryKeys.analytics.trend(query),
    queryFn: () => fetchTrend(query),
    enabled: !!query.startDate && !!query.endDate,
  });
}
