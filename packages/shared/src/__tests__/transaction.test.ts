import { describe, expect, it } from "@jest/globals";
import {
  createTransactionBodySchema,
  transactionFiltersSchema,
  transactionSchema,
  updateTransactionBodySchema,
} from "../transaction/schemas.js";
import { paginatedResponseSchema } from "../common/pagination.js";
import { MAX_PAGE_SIZE } from "../common/constants.js";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";
const CATEGORY_ID = "507f191e810c19729de860ea";
const USER_ID = "507f1f77bcf86cd799439012";

describe("transaction schemas", () => {
  describe("transactionSchema", () => {
    it("accepts a valid transaction", () => {
      const result = transactionSchema.parse({
        id: VALID_OBJECT_ID,
        userId: USER_ID,
        categoryId: CATEGORY_ID,
        amount: 42.5,
        type: "expense",
        description: "Coffee",
        date: "2024-01-15",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z",
      });

      expect(result.amount).toBe(42.5);
      expect(result.type).toBe("expense");
    });

    it("rejects non-positive amount and invalid type", () => {
      expect(() =>
        transactionSchema.parse({
          id: VALID_OBJECT_ID,
          userId: USER_ID,
          categoryId: CATEGORY_ID,
          amount: 0,
          type: "expense",
          date: "2024-01-15",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
        }),
      ).toThrow();

      expect(() =>
        transactionSchema.parse({
          id: VALID_OBJECT_ID,
          userId: USER_ID,
          categoryId: CATEGORY_ID,
          amount: 10,
          type: "transfer",
          date: "2024-01-15",
          createdAt: "2024-01-15T10:00:00.000Z",
          updatedAt: "2024-01-15T10:00:00.000Z",
        }),
      ).toThrow();
    });
  });

  describe("createTransactionBodySchema", () => {
    it("accepts valid create payload", () => {
      const result = createTransactionBodySchema.parse({
        categoryId: CATEGORY_ID,
        amount: 100,
        type: "income",
        date: "2024-02-01T00:00:00.000Z",
      });

      expect(result.type).toBe("income");
    });
  });

  describe("updateTransactionBodySchema", () => {
    it("accepts partial updates", () => {
      const result = updateTransactionBodySchema.parse({ amount: 25 });
      expect(result.amount).toBe(25);
    });

    it("rejects empty update payload", () => {
      expect(() => updateTransactionBodySchema.parse({})).toThrow();
    });
  });

  describe("transactionFiltersSchema", () => {
    it("applies default pagination", () => {
      const result = transactionFiltersSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("coerces string query params", () => {
      const result = transactionFiltersSchema.parse({
        page: "2",
        limit: "50",
        type: "expense",
        search: "coffee",
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
      expect(result.type).toBe("expense");
    });

    it("rejects limit above MAX_PAGE_SIZE", () => {
      expect(() =>
        transactionFiltersSchema.parse({ limit: MAX_PAGE_SIZE + 1 }),
      ).toThrow();
    });
  });

  describe("paginatedResponseSchema", () => {
    it("validates paginated transaction responses", () => {
      const schema = paginatedResponseSchema(transactionSchema);
      const result = schema.parse({
        items: [
          {
            id: VALID_OBJECT_ID,
            userId: USER_ID,
            categoryId: CATEGORY_ID,
            amount: 10,
            type: "expense",
            date: "2024-01-15",
            createdAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      expect(result.items).toHaveLength(1);
    });
  });
});
