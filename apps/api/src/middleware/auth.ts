import type { NextFunction, Request, Response } from "express";
import { unauthorized } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { UserModel } from "../models/User.js";

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw unauthorized();
    }

    const token = header.slice("Bearer ".length);
    const { userId } = verifyAccessToken(token);
    const user = await UserModel.findById(userId).select("_id email").lean();

    if (!user) {
      throw unauthorized();
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
    };
    next();
  } catch {
    next(unauthorized());
  }
}
