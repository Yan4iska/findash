import { z } from "zod";
import { isoDateSchema } from "../common/dates.js";
import { objectIdSchema } from "../common/objectId.js";

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

export const userPublicSchema = z.object({
  id: objectIdSchema,
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: isoDateSchema,
});

export type UserPublic = z.infer<typeof userPublicSchema>;
