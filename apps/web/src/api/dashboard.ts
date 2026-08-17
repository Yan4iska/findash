import type { DashboardLayout } from "@findash/shared";
import { apiClient } from "./client.js";

export async function fetchDashboardLayout(): Promise<DashboardLayout> {
  const { data } = await apiClient.get<DashboardLayout>("/dashboard/layout");
  return data;
}

export async function saveDashboardLayout(
  layout: DashboardLayout,
): Promise<DashboardLayout> {
  const { data } = await apiClient.put<DashboardLayout>(
    "/dashboard/layout",
    layout,
  );
  return data;
}
