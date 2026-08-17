import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DashboardLayout } from "@findash/shared";
import {
  fetchDashboardLayout,
  saveDashboardLayout,
} from "../api/dashboard.js";
import { queryKeys } from "./queryKeys.js";

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [
    {
      id: "summary",
      type: "summary",
      title: "Overview",
      grid: { x: 0, y: 0, w: 2, h: 1 },
    },
    {
      id: "categoryPie",
      type: "categoryPie",
      title: "Spending by Category",
      grid: { x: 0, y: 1, w: 1, h: 2 },
    },
    {
      id: "trendChart",
      type: "trendChart",
      title: "Income vs Expense",
      grid: { x: 1, y: 1, w: 1, h: 2 },
    },
    {
      id: "recentTransactions",
      type: "recentTransactions",
      title: "Recent Transactions",
      grid: { x: 0, y: 3, w: 2, h: 1 },
    },
  ],
};

export function useDashboardLayout() {
  return useQuery({
    queryKey: queryKeys.dashboard.layout,
    queryFn: fetchDashboardLayout,
    placeholderData: DEFAULT_DASHBOARD_LAYOUT,
  });
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (layout: DashboardLayout) => saveDashboardLayout(layout),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.dashboard.layout, data);
    },
  });
}
