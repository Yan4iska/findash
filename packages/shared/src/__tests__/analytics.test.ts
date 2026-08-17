import { describe, expect, it } from "@jest/globals";
import {
  analyticsPeriodQuerySchema,
  analyticsSummarySchema,
  categoryBreakdownItemSchema,
  trendPointSchema,
} from "../analytics/schemas.js";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("analytics schemas", () => {
  describe("analyticsPeriodQuerySchema", () => {
    it("accepts a valid period query", () => {
      const result = analyticsPeriodQuerySchema.parse({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        granularity: "week",
      });

      expect(result.granularity).toBe("week");
    });

    it("rejects invalid granularity", () => {
      expect(() =>
        analyticsPeriodQuerySchema.parse({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          granularity: "year",
        }),
      ).toThrow();
    });
  });

  describe("analyticsSummarySchema", () => {
    it("accepts summary totals", () => {
      const result = analyticsSummarySchema.parse({
        totalIncome: 5000,
        totalExpense: 3200,
        net: 1800,
        transactionCount: 42,
      });

      expect(result.net).toBe(1800);
    });

    it("rejects negative income", () => {
      expect(() =>
        analyticsSummarySchema.parse({
          totalIncome: -1,
          totalExpense: 0,
          net: 0,
          transactionCount: 0,
        }),
      ).toThrow();
    });
  });

  describe("categoryBreakdownItemSchema", () => {
    it("accepts breakdown items", () => {
      const result = categoryBreakdownItemSchema.parse({
        categoryId: VALID_OBJECT_ID,
        categoryName: "Food",
        total: 250,
        percentage: 35.5,
      });

      expect(result.categoryName).toBe("Food");
    });

    it("rejects invalid percentage", () => {
      expect(() =>
        categoryBreakdownItemSchema.parse({
          categoryId: VALID_OBJECT_ID,
          categoryName: "Food",
          total: 250,
          percentage: 101,
        }),
      ).toThrow();
    });
  });

  describe("trendPointSchema", () => {
    it("accepts trend points", () => {
      const result = trendPointSchema.parse({
        date: "2024-01-15",
        income: 100,
        expense: 50,
        net: 50,
      });

      expect(result.net).toBe(50);
    });
  });
});
