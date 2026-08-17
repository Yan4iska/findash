import { Router } from "express";
import { z } from "zod";
import {
  createTransactionBodySchema,
  objectIdSchema,
  transactionFiltersSchema,
  updateTransactionBodySchema,
  type TransactionFilters,
} from "@findash/shared";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as exportService from "../services/exportService.js";
import * as transactionService from "../services/transactionService.js";

export const transactionRouter: Router = Router();

transactionRouter.use(authMiddleware);

transactionRouter.get(
  "/export.csv",
  validate({ query: transactionFiltersSchema.partial() }),
  async (req, res, next) => {
    try {
      const csv = await exportService.buildTransactionsCsv(
        req.user!.id,
        req.query as Partial<TransactionFilters>,
      );
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="transactions.csv"',
      );
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.get(
  "/",
  validate({ query: transactionFiltersSchema }),
  async (req, res, next) => {
    try {
      const result = await transactionService.listTransactions(
        req.user!.id,
        req.query as unknown as TransactionFilters,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.get(
  "/:id",
  validate({ params: z.object({ id: objectIdSchema }) }),
  async (req, res, next) => {
    try {
      const transaction = await transactionService.getTransaction(
        req.user!.id,
        req.params.id as string,
      );
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.post(
  "/",
  validate({ body: createTransactionBodySchema }),
  async (req, res, next) => {
    try {
      const transaction = await transactionService.createTransaction(
        req.user!.id,
        req.body,
      );
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.put(
  "/:id",
  validate({
    params: z.object({ id: objectIdSchema }),
    body: updateTransactionBodySchema,
  }),
  async (req, res, next) => {
    try {
      const transaction = await transactionService.updateTransaction(
        req.user!.id,
        req.params.id as string,
        req.body,
      );
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },
);

transactionRouter.delete(
  "/:id",
  validate({ params: z.object({ id: objectIdSchema }) }),
  async (req, res, next) => {
    try {
      await transactionService.deleteTransaction(
        req.user!.id,
        req.params.id as string,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
