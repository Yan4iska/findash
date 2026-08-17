import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { authTokensSchema, userPublicSchema } from "@findash/shared";
import { getApp, registerUser } from "./helpers.js";

describe("auth", () => {
  it("registers a new user", async () => {
    const app = getApp();
    const response = await registerUser(app);

    expect(response.status).toBe(201);
    expect(userPublicSchema.safeParse(response.body.user).success).toBe(true);
    expect(authTokensSchema.safeParse(response.body).success).toBe(true);
  });

  it("rejects duplicate registration", async () => {
    const app = getApp();
    await registerUser(app);

    const response = await registerUser(app);
    expect(response.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    const app = getApp();
    await registerUser(app);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("user@example.com");
  });

  it("rejects invalid credentials", async () => {
    const app = getApp();
    await registerUser(app);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
  });

  it("rotates refresh tokens", async () => {
    const app = getApp();
    const registerResponse = await registerUser(app);
    const { refreshToken } = registerResponse.body;

    const refreshResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);

    const staleRefresh = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(staleRefresh.status).toBe(401);
  });

  it("logs out and revokes refresh token", async () => {
    const app = getApp();
    const registerResponse = await registerUser(app);
    const { refreshToken } = registerResponse.body;

    const logoutResponse = await request(app)
      .post("/auth/logout")
      .send({ refreshToken });

    expect(logoutResponse.status).toBe(204);

    const refreshResponse = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(401);
  });

  it("returns health check", async () => {
    const app = getApp();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
