import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import {
  createRecurringTransactionBodySchema,
  createSavingsGoalBodySchema,
  forecastQuerySchema,
  objectIdSchema,
} from '@findash/shared';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as forecastService from '../services/forecastService.js';

export const forecastRouter: ExpressRouter = Router();
forecastRouter.use(authMiddleware);
forecastRouter.get('/', validate({ query: forecastQuerySchema }), async (req, res, next) => {
  try {
    res.json(await forecastService.getForecast(req.user!.id, req.query as never));
  } catch (error) {
    next(error);
  }
});
forecastRouter.get('/recurring', async (req, res, next) => {
  try {
    res.json(await forecastService.listRecurring(req.user!.id));
  } catch (error) {
    next(error);
  }
});
forecastRouter.post(
  '/recurring',
  validate({ body: createRecurringTransactionBodySchema }),
  async (req, res, next) => {
    try {
      res.status(201).json(await forecastService.createRecurring(req.user!.id, req.body));
    } catch (error) {
      next(error);
    }
  },
);
forecastRouter.delete(
  '/recurring/:id',
  validate({ params: z.object({ id: objectIdSchema }) }),
  async (req, res, next) => {
    try {
      await forecastService.deleteRecurring(req.user!.id, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
forecastRouter.get('/goals', async (req, res, next) => {
  try {
    res.json(await forecastService.listGoals(req.user!.id));
  } catch (error) {
    next(error);
  }
});
forecastRouter.post(
  '/goals',
  validate({ body: createSavingsGoalBodySchema }),
  async (req, res, next) => {
    try {
      res.status(201).json(await forecastService.createGoal(req.user!.id, req.body));
    } catch (error) {
      next(error);
    }
  },
);
forecastRouter.delete(
  '/goals/:id',
  validate({ params: z.object({ id: objectIdSchema }) }),
  async (req, res, next) => {
    try {
      await forecastService.deleteGoal(req.user!.id, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
