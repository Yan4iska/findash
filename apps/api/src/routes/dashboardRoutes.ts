import { Router } from "express";
import { dashboardLayoutSchema } from "@findash/shared";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as dashboardService from "../services/dashboardService.js";

export const dashboardRouter: Router = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/layout", async (req, res, next) => {
  try {
    const layout = await dashboardService.getLayout(req.user!.id);
    res.json(layout);
  } catch (error) {
    next(error);
  }
});

dashboardRouter.put(
  "/layout",
  validate({ body: dashboardLayoutSchema }),
  async (req, res, next) => {
    try {
      const layout = await dashboardService.saveLayout(req.user!.id, req.body);
      res.json(layout);
    } catch (error) {
      next(error);
    }
  },
);
