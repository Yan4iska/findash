import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { transactionSchema } from "@findash/shared";
import {
  authHeader,
  createCategory,
  getApp,
  registerUser,
} from "./helpers.js";

describe("transactions", () => {
  async function seedAuthAndCategory(app: ReturnType<typeof getApp>) {
    const auth = await registerUser(app);
    const token = auth.body.accessToken;
    const category = await createCategory(app, token, "Food");
    return { token, categoryId: category.body.id };
  }

  it("supports CRUD, pagination, filters, CSV export, and user isolation", async () => {
    const app = getApp();
    const { token, categoryId } = await seedAuthAndCategory(app);

    const createResponse = await request(app)
      .post("/transactions")
      .set(authHeader(token))
      .send({
        categoryId,
        amount: 25.5,
        type: "expense",
        description: "Lunch",
        date: "2024-01-15T12:00:00.000Z",
      });

    expect(createResponse.status).toBe(201);
    expect(transactionSchema.safeParse(createResponse.body).success).toBe(true);

    const transactionId = createResponse.body.id;

    await request(app)
      .post("/transactions")
      .set(authHeader(token))
      .send({
        categoryId,
        amount: 100,
        type: "income",
        date: "2024-01-20T12:00:00.000Z",
      });

    const listResponse = await request(app)
      .get("/transactions")
      .set(authHeader(token))
      .query({ page: 1, limit: 1, type: "expense" });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);
    expect(listResponse.body.total).toBe(1);

    const getResponse = await request(app)
      .get(`/transactions/${transactionId}`)
      .set(authHeader(token));

    expect(getResponse.status).toBe(200);

    const updateResponse = await request(app)
      .put(`/transactions/${transactionId}`)
      .set(authHeader(token))
      .send({ amount: 30 });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.amount).toBe(30);

    const csvResponse = await request(app)
      .get("/transactions/export.csv")
      .set(authHeader(token));

    expect(csvResponse.status).toBe(200);
    expect(csvResponse.headers["content-type"]).toContain("text/csv");
    expect(csvResponse.text).toContain("date,type,amount,category,description");
    expect(csvResponse.text).toContain("expense");

    const deleteResponse = await request(app)
      .delete(`/transactions/${transactionId}`)
      .set(authHeader(token));

    expect(deleteResponse.status).toBe(204);

    const otherUser = await registerUser(app, "other@example.com");
    const isolated = await request(app)
      .get(`/transactions/${transactionId}`)
      .set(authHeader(otherUser.body.accessToken));

    expect(isolated.status).toBe(404);
  });
});
