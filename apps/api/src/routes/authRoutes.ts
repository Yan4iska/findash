import { Router } from "express";
import { z } from "zod";
import {
  loginBodySchema,
  registerBodySchema,
} from "@findash/shared";
import { validate } from "../middleware/validate.js";
import * as authService from "../services/authService.js";

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const authRouter: Router = Router();

function sessionMeta(req: { get: (name: string) => string | undefined }) {
  return {
    userAgent: req.get("user-agent"),
    ip: req.get("x-forwarded-for") ?? req.get("x-real-ip"),
  };
}

authRouter.post(
  "/register",
  validate({ body: registerBodySchema }),
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body, sessionMeta(req));
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/login",
  validate({ body: loginBodySchema }),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body, sessionMeta(req));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/refresh",
  validate({ body: refreshBodySchema }),
  async (req, res, next) => {
    try {
      const result = await authService.refresh(
        req.body.refreshToken,
        sessionMeta(req),
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post(
  "/logout",
  validate({ body: refreshBodySchema }),
  async (req, res, next) => {
    try {
      await authService.logout(req.body.refreshToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
