import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { categorySchema } from "@findash/shared";
import { authHeader, createCategory, getApp, registerUser } from "./helpers.js";

describe("categories", () => {
  it("creates, lists, updates, reorders, and deletes categories", async () => {
    const app = getApp();
    const auth = await registerUser(app);
    const token = auth.body.accessToken;

    const createOne = await createCategory(app, token, "Food", "#ff0000");
    const createTwo = await createCategory(app, token, "Transport");

    expect(createOne.status).toBe(201);
    expect(categorySchema.safeParse(createOne.body).success).toBe(true);
    expect(createTwo.body.color).toMatch(/^#[0-9a-fA-F]{6}$/);

    const listResponse = await request(app)
      .get("/categories")
      .set(authHeader(token));

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(2);

    const categoryId = createOne.body.id;
    const updateResponse = await request(app)
      .put(`/categories/${categoryId}`)
      .set(authHeader(token))
      .send({ name: "Groceries" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe("Groceries");

    const reorderResponse = await request(app)
      .patch("/categories/reorder")
      .set(authHeader(token))
      .send({ orderedIds: [createTwo.body.id, categoryId] });

    expect(reorderResponse.status).toBe(200);
    expect(reorderResponse.body[0].name).toBe("Transport");

    const deleteResponse = await request(app)
      .delete(`/categories/${categoryId}`)
      .set(authHeader(token));

    expect(deleteResponse.status).toBe(204);
  });

  it("isolates categories by user", async () => {
    const app = getApp();
    const userOne = await registerUser(app, "one@example.com");
    const userTwo = await registerUser(app, "two@example.com");

    const category = await createCategory(
      app,
      userOne.body.accessToken,
      "Private",
    );

    const forbidden = await request(app)
      .put(`/categories/${category.body.id}`)
      .set(authHeader(userTwo.body.accessToken))
      .send({ name: "Hacked" });

    expect(forbidden.status).toBe(404);
  });
});
