import { describe, expect, it } from "@jest/globals";
import {
  dashboardLayoutSchema,
  widgetConfigSchema,
  widgetTypeSchema,
} from "../dashboard/schemas.js";

describe("dashboard schemas", () => {
  describe("widgetTypeSchema", () => {
    it("accepts valid widget types", () => {
      expect(widgetTypeSchema.parse("summary")).toBe("summary");
      expect(widgetTypeSchema.parse("recentTransactions")).toBe(
        "recentTransactions",
      );
    });

    it("rejects unknown widget types", () => {
      expect(() => widgetTypeSchema.parse("unknown")).toThrow();
    });
  });

  describe("widgetConfigSchema", () => {
    it("accepts widget configuration", () => {
      const result = widgetConfigSchema.parse({
        id: "widget-1",
        type: "trendChart",
        title: "Monthly trend",
        grid: { x: 0, y: 0, w: 6, h: 4 },
      });

      expect(result.type).toBe("trendChart");
    });

    it("rejects invalid grid dimensions", () => {
      expect(() =>
        widgetConfigSchema.parse({
          id: "widget-1",
          type: "summary",
          grid: { x: 0, y: 0, w: 0, h: 4 },
        }),
      ).toThrow();
    });
  });

  describe("dashboardLayoutSchema", () => {
    it("accepts a layout with multiple widgets", () => {
      const result = dashboardLayoutSchema.parse({
        widgets: [
          {
            id: "widget-1",
            type: "summary",
            grid: { x: 0, y: 0, w: 12, h: 2 },
          },
          {
            id: "widget-2",
            type: "categoryPie",
            grid: { x: 0, y: 2, w: 6, h: 4 },
          },
        ],
      });

      expect(result.widgets).toHaveLength(2);
    });
  });
});
