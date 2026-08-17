import type { DashboardLayout } from "@findash/shared";
import { dashboardLayoutSchema } from "@findash/shared";
import { DashboardLayoutModel } from "../models/DashboardLayout.js";
import { toDashboardLayout } from "../utils/mappers.js";

export async function getLayout(userId: string): Promise<DashboardLayout> {
  const layout = await DashboardLayoutModel.findOne({ userId });
  if (!layout) {
    return { widgets: [] };
  }
  return toDashboardLayout(layout);
}

export async function saveLayout(
  userId: string,
  body: DashboardLayout,
): Promise<DashboardLayout> {
  const parsed = dashboardLayoutSchema.parse(body);

  const layout = await DashboardLayoutModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        widgets: parsed.widgets,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  return toDashboardLayout(layout);
}
