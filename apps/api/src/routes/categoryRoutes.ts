import { Router } from "express";
import { z } from "zod";
import {
  createCategoryBodySchema,
  objectIdSchema,
  reorderCategoriesBodySchema,
  updateCategoryBodySchema,
} from "@findash/shared";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as categoryService from "../services/categoryService.js";

export const categoryRouter: Router = Router();

categoryRouter.use(authMiddleware);

categoryRouter.get("/", async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories(req.user!.id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

categoryRouter.post(
  "/",
  validate({ body: createCategoryBodySchema }),
  async (req, res, next) => {
    try {
      const category = await categoryService.createCategory(
        req.user!.id,
        req.body,
      );
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },
);

categoryRouter.patch(
  "/reorder",
  validate({ body: reorderCategoriesBodySchema }),
  async (req, res, next) => {
    try {
      const categories = await categoryService.reorderCategories(
        req.user!.id,
        req.body,
      );
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },
);

categoryRouter.put(
  "/:id",
  validate({
    params: z.object({ id: objectIdSchema }),
    body: updateCategoryBodySchema,
  }),
  async (req, res, next) => {
    try {
      const category = await categoryService.updateCategory(
        req.user!.id,
        req.params.id as string,
        req.body,
      );
      res.json(category);
    } catch (error) {
      next(error);
    }
  },
);

categoryRouter.delete(
  "/:id",
  validate({ params: z.object({ id: objectIdSchema }) }),
  async (req, res, next) => {
    try {
      await categoryService.deleteCategory(req.user!.id, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
