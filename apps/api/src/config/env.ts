import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export function getEnv(): Env {
  if (!cachedEnv) {
    return loadEnv();
  }
  return cachedEnv;
}

export function getMongoUri(): string {
  return envSchema.shape.MONGODB_URI.parse(process.env.MONGODB_URI);
}

export const env = {
  get PORT() {
    return getEnv().PORT;
  },
  get MONGODB_URI() {
    return getMongoUri();
  },
  get JWT_ACCESS_SECRET() {
    return getEnv().JWT_ACCESS_SECRET;
  },
  get JWT_REFRESH_SECRET() {
    return getEnv().JWT_REFRESH_SECRET;
  },
  get CORS_ORIGIN() {
    return getEnv().CORS_ORIGIN;
  },
  get NODE_ENV() {
    return getEnv().NODE_ENV;
  },
};
