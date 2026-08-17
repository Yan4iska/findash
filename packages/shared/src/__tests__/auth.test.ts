import { describe, expect, it } from "@jest/globals";
import {
  loginBodySchema,
  registerBodySchema,
  authTokensSchema,
  userPublicSchema,
} from "../auth/schemas.js";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("auth schemas", () => {
  describe("registerBodySchema", () => {
    it("accepts valid registration input", () => {
      const result = registerBodySchema.parse({
        email: "user@example.com",
        password: "password123",
        name: "Jane Doe",
      });

      expect(result.email).toBe("user@example.com");
      expect(result.name).toBe("Jane Doe");
    });

    it("accepts registration without optional name", () => {
      const result = registerBodySchema.parse({
        email: "user@example.com",
        password: "password123",
      });

      expect(result.name).toBeUndefined();
    });

    it("rejects invalid email and short password", () => {
      expect(() =>
        registerBodySchema.parse({
          email: "not-an-email",
          password: "short",
        }),
      ).toThrow();
    });
  });

  describe("loginBodySchema", () => {
    it("accepts valid login input", () => {
      const result = loginBodySchema.parse({
        email: "user@example.com",
        password: "any-password",
      });

      expect(result.email).toBe("user@example.com");
    });

    it("rejects empty password", () => {
      expect(() =>
        loginBodySchema.parse({
          email: "user@example.com",
          password: "",
        }),
      ).toThrow();
    });
  });

  describe("authTokensSchema", () => {
    it("accepts non-empty token strings", () => {
      const result = authTokensSchema.parse({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      expect(result.accessToken).toBe("access-token");
    });

    it("rejects empty tokens", () => {
      expect(() =>
        authTokensSchema.parse({
          accessToken: "",
          refreshToken: "refresh-token",
        }),
      ).toThrow();
    });
  });

  describe("userPublicSchema", () => {
    it("accepts a valid public user", () => {
      const result = userPublicSchema.parse({
        id: VALID_OBJECT_ID,
        email: "user@example.com",
        name: "Jane Doe",
        createdAt: "2024-01-15T10:00:00.000Z",
      });

      expect(result.id).toBe(VALID_OBJECT_ID);
    });

    it("rejects invalid id and createdAt", () => {
      expect(() =>
        userPublicSchema.parse({
          id: "invalid",
          email: "user@example.com",
          createdAt: "2024-01-15T10:00:00.000Z",
        }),
      ).toThrow();

      expect(() =>
        userPublicSchema.parse({
          id: VALID_OBJECT_ID,
          email: "user@example.com",
          createdAt: "not-a-date",
        }),
      ).toThrow();
    });
  });
});
