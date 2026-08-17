import mongoose, { type HydratedDocument, Schema, Types } from "mongoose";
import type { WidgetConfig } from "@findash/shared";

export interface DashboardLayout {
  userId: Types.ObjectId;
  widgets: WidgetConfig[];
  updatedAt: Date;
}

export type DashboardLayoutDocument = HydratedDocument<DashboardLayout>;

const widgetGridSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  { _id: false },
);

const widgetConfigSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["summary", "categoryPie", "trendChart", "recentTransactions"],
      required: true,
    },
    title: { type: String },
    grid: { type: widgetGridSchema, required: true },
  },
  { _id: false },
);

const dashboardLayoutSchema = new Schema<DashboardLayout>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    widgets: { type: [widgetConfigSchema], default: [] },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const DashboardLayoutModel = mongoose.model<DashboardLayout>(
  "DashboardLayout",
  dashboardLayoutSchema,
);
