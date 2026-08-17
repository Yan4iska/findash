import { describe, expect, it } from "@jest/globals";
import {
  categorySchema,
  createCategoryBodySchema,
  reorderCategoriesBodySchema,
  updateCategoryBodySchema,
} from "../category/schemas.js";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";
const OTHER_OBJECT_ID = "507f191e810c19729de860ea";

describe("category schemas", () => {
  describe("categorySchema", () => {
    it("accepts a valid category", () => {
      const result = categorySchema.parse({
        id: VALID_OBJECT_ID,
        userId: OTHER_OBJECT_ID,
        name: "Groceries",
        color: "#6366f1",
        icon: "cart",
        sortOrder: 0,
        createdAt: "2024-01-15T10:00:00.000Z",
      });

      expect(result.name).toBe("Groceries");
    });

    it("rejects invalid color", () => {
      expect(() =>
        categorySchema.parse({
          id: VALID_OBJECT_ID,
          userId: OTHER_OBJECT_ID,
          name: "Groceries",
          color: "blue",
          sortOrder: 0,
          createdAt: "2024-01-15T10:00:00.000Z",
        }),
      ).toThrow();
    });
  });

  describe("createCategoryBodySchema", () => {
    it("accepts minimal create payload", () => {
      const result = createCategoryBodySchema.parse({ name: "Transport" });
      expect(result.name).toBe("Transport");
    });
  });

  describe("updateCategoryBodySchema", () => {
    it("accepts partial updates", () => {
      const result = updateCategoryBodySchema.parse({ name: "Updated" });
      expect(result.name).toBe("Updated");
    });

    it("rejects empty update payload", () => {
      expect(() => updateCategoryBodySchema.parse({})).toThrow();
    });
  });

  describe("reorderCategoriesBodySchema", () => {
    it("accepts ordered ids", () => {
      const result = reorderCategoriesBodySchema.parse({
        orderedIds: [VALID_OBJECT_ID, OTHER_OBJECT_ID],
      });

      expect(result.orderedIds).toHaveLength(2);
    });

    it("rejects empty orderedIds", () => {
      expect(() =>
        reorderCategoriesBodySchema.parse({ orderedIds: [] }),
      ).toThrow();
    });
  });
});
