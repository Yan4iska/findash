import request from "supertest";
import { createApp } from "../src/app.js";
import type { Express } from "express";

export function getApp(): Express {
  return createApp();
}

export async function registerUser(
  app: Express,
  email = "user@example.com",
  password = "password123",
  name = "Test User",
) {
  const response = await request(app)
    .post("/auth/register")
    .send({ email, password, name });

  return response;
}

export async function loginUser(
  app: Express,
  email = "user@example.com",
  password = "password123",
) {
  return request(app).post("/auth/login").send({ email, password });
}

export function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function createCategory(
  app: Express,
  accessToken: string,
  name: string,
  color?: string,
) {
  return request(app)
    .post("/categories")
    .set(authHeader(accessToken))
    .send(color ? { name, color } : { name });
}
