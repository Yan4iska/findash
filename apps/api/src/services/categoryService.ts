import { DEFAULT_CATEGORY_COLORS } from "@findash/shared";
import type {
  CreateCategoryBody,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@findash/shared";
import { CategoryModel } from "../models/Category.js";
import { TransactionModel } from "../models/Transaction.js";
import { conflict, notFound } from "../utils/errors.js";
import { toCategory } from "../utils/mappers.js";

function pickDefaultColor(existingCount: number): string {
  return DEFAULT_CATEGORY_COLORS[
    existingCount % DEFAULT_CATEGORY_COLORS.length
  ] as string;
}

export async function listCategories(userId: string) {
  const categories = await CategoryModel.find({ userId })
    .sort({ sortOrder: 1 })
    .exec();
  return categories.map(toCategory);
}

export async function createCategory(userId: string, body: CreateCategoryBody) {
  const count = await CategoryModel.countDocuments({ userId });
  const category = await CategoryModel.create({
    userId,
    name: body.name,
    color: body.color ?? pickDefaultColor(count),
    icon: body.icon,
    sortOrder: count,
  });
  return toCategory(category);
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  body: UpdateCategoryBody,
) {
  const category = await CategoryModel.findOneAndUpdate(
    { _id: categoryId, userId },
    { $set: body },
    { new: true, runValidators: true },
  );

  if (!category) {
    throw notFound("Category not found");
  }

  return toCategory(category);
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await CategoryModel.findOne({ _id: categoryId, userId });
  if (!category) {
    throw notFound("Category not found");
  }

  const inUse = await TransactionModel.exists({ userId, categoryId });
  if (inUse) {
    throw conflict("Category has transactions and cannot be deleted");
  }

  await CategoryModel.deleteOne({ _id: categoryId, userId });
}

export async function reorderCategories(
  userId: string,
  body: ReorderCategoriesBody,
) {
  const categories = await CategoryModel.find({ userId }).exec();
  const categoryIds = new Set(categories.map((c) => c._id.toString()));

  for (const id of body.orderedIds) {
    if (!categoryIds.has(id)) {
      throw notFound(`Category not found: ${id}`);
    }
  }

  await Promise.all(
    body.orderedIds.map((id, index) =>
      CategoryModel.updateOne({ _id: id, userId }, { sortOrder: index }),
    ),
  );

  return listCategories(userId);
}
