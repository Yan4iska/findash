import { env } from "./env.js";

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
] as const;

/**
 * Resolves allowed CORS origins.
 * In development, always permits common Vite dev URLs in addition to CORS_ORIGIN.
 */
export function resolveCorsOrigin(): string | string[] {
  const configured = env.CORS_ORIGIN;

  if (env.NODE_ENV === "development") {
    return [...new Set([configured, ...DEV_ORIGINS])];
  }

  return configured;
}
