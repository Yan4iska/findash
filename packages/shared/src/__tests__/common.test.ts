import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_CATEGORY_COLORS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_TYPES,
} from "../common/constants.js";
import { apiErrorSchema } from "../common/apiError.js";

describe("common exports", () => {
  it("exports pagination constants", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MAX_PAGE_SIZE).toBe(100);
  });

  it("exports transaction types", () => {
    expect(TRANSACTION_TYPES).toEqual(["income", "expense"]);
  });

  it("exports default category colors as hex values", () => {
    expect(DEFAULT_CATEGORY_COLORS.length).toBeGreaterThan(0);
    for (const color of DEFAULT_CATEGORY_COLORS) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  describe("apiErrorSchema", () => {
    it("accepts minimal and extended errors", () => {
      expect(apiErrorSchema.parse({ message: "Not found" }).message).toBe(
        "Not found",
      );

      const result = apiErrorSchema.parse({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: { field: "email" },
      });

      expect(result.code).toBe("VALIDATION_ERROR");
    });

    it("rejects missing message", () => {
      expect(() => apiErrorSchema.parse({ code: "ERROR" })).toThrow();
    });
  });
});
