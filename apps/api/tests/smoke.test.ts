import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import {
  analyticsSummarySchema,
  categorySchema,
  dashboardLayoutSchema,
  transactionSchema,
} from "@findash/shared";
import { authHeader, createCategory, getApp, registerUser } from "./helpers.js";

/**
 * End-to-end API smoke test covering the MVP user journey.
 * Mirrors the manual checklist in README.md.
 */
describe("MVP smoke flow", () => {
  it("register → category → transaction → analytics → reorder → dashboard → export → logout", async () => {
    const app = getApp();

    const registerResponse = await registerUser(
      app,
      "smoke@example.com",
      "password123",
      "Smoke Tester",
    );
    expect(registerResponse.status).toBe(201);
    const { accessToken, refreshToken } = registerResponse.body;

    const categoryResponse = await createCategory(
      app,
      accessToken,
      "Groceries",
      "#22c55e",
    );
    expect(categoryResponse.status).toBe(201);
    expect(categorySchema.safeParse(categoryResponse.body).success).toBe(true);
    const categoryId = categoryResponse.body.id;

    const categoryTwo = await createCategory(
      app,
      accessToken,
      "Transport",
      "#3b82f6",
    );
    expect(categoryTwo.status).toBe(201);

    const transactionResponse = await request(app)
      .post("/transactions")
      .set(authHeader(accessToken))
      .send({
        amount: 42.5,
        type: "expense",
        categoryId,
        date: "2026-01-15T12:00:00.000Z",
        description: "Weekly shop",
      });

    expect(transactionResponse.status).toBe(201);
    expect(transactionSchema.safeParse(transactionResponse.body).success).toBe(
      true,
    );

    const analyticsQuery = {
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      granularity: "month",
    };

    const summaryResponse = await request(app)
      .get("/analytics/summary")
      .set(authHeader(accessToken))
      .query(analyticsQuery);

    expect(summaryResponse.status).toBe(200);
    expect(analyticsSummarySchema.safeParse(summaryResponse.body).success).toBe(
      true,
    );

    const breakdownResponse = await request(app)
      .get("/analytics/category-breakdown")
      .set(authHeader(accessToken))
      .query(analyticsQuery);

    expect(breakdownResponse.status).toBe(200);
    expect(Array.isArray(breakdownResponse.body)).toBe(true);

    const reorderResponse = await request(app)
      .patch("/categories/reorder")
      .set(authHeader(accessToken))
      .send({ orderedIds: [categoryTwo.body.id, categoryId] });

    expect(reorderResponse.status).toBe(200);
    expect(reorderResponse.body[0].id).toBe(categoryTwo.body.id);

    const layout = {
      widgets: [
        {
          id: "summary-1",
          type: "summary",
          title: "Overview",
          grid: { x: 0, y: 0, w: 2, h: 1 },
        },
        {
          id: "trend-1",
          type: "trendChart",
          grid: { x: 0, y: 1, w: 2, h: 2 },
        },
      ],
    };

    const layoutPutResponse = await request(app)
      .put("/dashboard/layout")
      .set(authHeader(accessToken))
      .send(layout);

    expect(layoutPutResponse.status).toBe(200);
    expect(dashboardLayoutSchema.safeParse(layoutPutResponse.body).success).toBe(
      true,
    );

    const layoutGetResponse = await request(app)
      .get("/dashboard/layout")
      .set(authHeader(accessToken));

    expect(layoutGetResponse.status).toBe(200);
    expect(layoutGetResponse.body.widgets).toHaveLength(2);

    const exportResponse = await request(app)
      .get("/transactions/export.csv")
      .set(authHeader(accessToken));

    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers["content-type"]).toMatch(/text\/csv/);
    expect(exportResponse.text).toContain("Weekly shop");

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .send({ refreshToken });

    expect(logoutResponse.status).toBe(204);

    const refreshAfterLogout = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });
});
