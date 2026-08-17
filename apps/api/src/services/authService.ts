import bcrypt from "bcryptjs";
import type { LoginBody, RegisterBody } from "@findash/shared";
import { UserModel } from "../models/User.js";
import { SessionModel } from "../models/Session.js";
import { conflict, unauthorized } from "../utils/errors.js";
import {
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
  signAccessToken,
} from "../utils/tokens.js";
import { toUserPublic } from "../utils/mappers.js";
import type { Types } from "mongoose";

const BCRYPT_ROUNDS = 12;

interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

async function createSession(
  userId: Types.ObjectId,
  meta: SessionMeta = {},
): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await SessionModel.create({
    userId,
    refreshTokenHash,
    expiresAt: getRefreshTokenExpiresAt(),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return {
    accessToken: signAccessToken(userId.toString()),
    refreshToken,
  };
}

export async function register(
  body: RegisterBody,
  meta: SessionMeta = {},
) {
  const existing = await UserModel.findOne({ email: body.email.toLowerCase() });
  if (existing) {
    throw conflict("Email already registered");
  }

  const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
  const user = await UserModel.create({
    email: body.email.toLowerCase(),
    passwordHash,
    name: body.name,
  });

  const tokens = await createSession(user._id, meta);

  return {
    ...tokens,
    user: toUserPublic(user),
  };
}

export async function login(body: LoginBody, meta: SessionMeta = {}) {
  const user = await UserModel.findOne({ email: body.email.toLowerCase() });
  if (!user) {
    throw unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid email or password");
  }

  const tokens = await createSession(user._id, meta);

  return {
    ...tokens,
    user: toUserPublic(user),
  };
}

export async function refresh(refreshToken: string, meta: SessionMeta = {}) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await SessionModel.findOne({ refreshTokenHash });

  if (!session) {
    throw unauthorized("Invalid refresh token");
  }

  if (session.revokedAt) {
    await SessionModel.updateMany(
      { userId: session.userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
    throw unauthorized("Refresh token reuse detected");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    throw unauthorized("Refresh token expired");
  }

  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const newSession = await SessionModel.create({
    userId: session.userId,
    refreshTokenHash: newRefreshTokenHash,
    expiresAt: getRefreshTokenExpiresAt(),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  session.revokedAt = new Date();
  session.replacedBySessionId = newSession._id;
  await session.save();

  return {
    accessToken: signAccessToken(session.userId.toString()),
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await SessionModel.findOne({ refreshTokenHash });

  if (!session || session.revokedAt) {
    return;
  }

  session.revokedAt = new Date();
  await session.save();
}
