import { Router } from "express";
import { analyticsPeriodQuerySchema } from "@findash/shared";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as analyticsService from "../services/analyticsService.js";

export const analyticsRouter: Router = Router();

analyticsRouter.use(authMiddleware);

async function summaryHandler(
  req: { user?: { id: string }; query: unknown },
  res: { json: (body: unknown) => void },
  next: (error: unknown) => void,
) {
  try {
    const summary = await analyticsService.getSummary(
      req.user!.id,
      req.query as Parameters<typeof analyticsService.getSummary>[1],
    );
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

async function breakdownHandler(
  req: { user?: { id: string }; query: unknown },
  res: { json: (body: unknown) => void },
  next: (error: unknown) => void,
) {
  try {
    const breakdown = await analyticsService.getCategoryBreakdown(
      req.user!.id,
      req.query as Parameters<typeof analyticsService.getCategoryBreakdown>[1],
    );
    res.json(breakdown);
  } catch (error) {
    next(error);
  }
}

async function trendHandler(
  req: { user?: { id: string }; query: unknown },
  res: { json: (body: unknown) => void },
  next: (error: unknown) => void,
) {
  try {
    const trends = await analyticsService.getTrends(
      req.user!.id,
      req.query as Parameters<typeof analyticsService.getTrends>[1],
    );
    res.json(trends);
  } catch (error) {
    next(error);
  }
}

const periodValidator = validate({ query: analyticsPeriodQuerySchema });

analyticsRouter.get("/summary", periodValidator, summaryHandler);
analyticsRouter.get("/category-breakdown", periodValidator, breakdownHandler);
analyticsRouter.get("/by-category", periodValidator, breakdownHandler);
analyticsRouter.get("/trend", periodValidator, trendHandler);
analyticsRouter.get("/trends", periodValidator, trendHandler);
