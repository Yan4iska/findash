import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import {
  analyticsSummarySchema,
  categoryBreakdownItemSchema,
  trendPointSchema,
} from "@findash/shared";
import {
  authHeader,
  createCategory,
  getApp,
  registerUser,
} from "./helpers.js";

describe("analytics", () => {
  it("returns summary, category breakdown, and trends for seeded data", async () => {
    const app = getApp();
    const auth = await registerUser(app);
    const token = auth.body.accessToken;
    const category = await createCategory(app, token, "Food");

    await request(app)
      .post("/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.body.id,
        amount: 200,
        type: "expense",
        date: "2024-01-10T10:00:00.000Z",
      });

    await request(app)
      .post("/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.body.id,
        amount: 500,
        type: "income",
        date: "2024-01-12T10:00:00.000Z",
      });

    const query = {
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      granularity: "day",
    };

    const summaryResponse = await request(app)
      .get("/analytics/summary")
      .set(authHeader(token))
      .query(query);

    expect(summaryResponse.status).toBe(200);
    expect(analyticsSummarySchema.safeParse(summaryResponse.body).success).toBe(
      true,
    );
    expect(summaryResponse.body.totalIncome).toBe(500);
    expect(summaryResponse.body.totalExpense).toBe(200);
    expect(summaryResponse.body.net).toBe(300);

    const breakdownResponse = await request(app)
      .get("/analytics/category-breakdown")
      .set(authHeader(token))
      .query(query);

    expect(breakdownResponse.status).toBe(200);
    expect(breakdownResponse.body).toHaveLength(1);
    expect(
      categoryBreakdownItemSchema.safeParse(breakdownResponse.body[0]).success,
    ).toBe(true);

    const trendResponse = await request(app)
      .get("/analytics/trend")
      .set(authHeader(token))
      .query(query);

    expect(trendResponse.status).toBe(200);
    expect(trendResponse.body.length).toBeGreaterThan(0);
    expect(trendPointSchema.safeParse(trendResponse.body[0]).success).toBe(
      true,
    );
  });
});
