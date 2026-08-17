import type {
  CreateTransactionBody,
  PaginatedResponse,
  TransactionFilters,
  UpdateTransactionBody,
} from "@findash/shared";
import { CategoryModel } from "../models/Category.js";
import { TransactionModel } from "../models/Transaction.js";
import { badRequest, notFound } from "../utils/errors.js";
import { toTransaction } from "../utils/mappers.js";
import type { FilterQuery } from "mongoose";
import type { Transaction } from "../models/Transaction.js";

async function assertCategoryOwned(
  userId: string,
  categoryId: string,
): Promise<void> {
  const category = await CategoryModel.exists({ _id: categoryId, userId });
  if (!category) {
    throw badRequest("Invalid category");
  }
}

function buildFilter(
  userId: string,
  filters: TransactionFilters,
): FilterQuery<Transaction> {
  const query: FilterQuery<Transaction> = { userId };

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.search) {
    query.description = { $regex: filters.search, $options: "i" };
  }

  return query;
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters,
): Promise<PaginatedResponse<ReturnType<typeof toTransaction>>> {
  const query = buildFilter(userId, filters);
  const skip = (filters.page - 1) * filters.limit;

  const [items, total] = await Promise.all([
    TransactionModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .exec(),
    TransactionModel.countDocuments(query),
  ]);

  return {
    items: items.map(toTransaction),
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit) || 0,
  };
}

export async function getTransaction(userId: string, transactionId: string) {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw notFound("Transaction not found");
  }

  return toTransaction(transaction);
}

export async function createTransaction(
  userId: string,
  body: CreateTransactionBody,
) {
  await assertCategoryOwned(userId, body.categoryId);

  const transaction = await TransactionModel.create({
    userId,
    categoryId: body.categoryId,
    amount: body.amount,
    type: body.type,
    description: body.description,
    date: new Date(body.date),
  });

  return toTransaction(transaction);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  body: UpdateTransactionBody,
) {
  if (body.categoryId) {
    await assertCategoryOwned(userId, body.categoryId);
  }

  const update: Record<string, unknown> = { ...body };
  if (body.date) {
    update.date = new Date(body.date);
  }

  const transaction = await TransactionModel.findOneAndUpdate(
    { _id: transactionId, userId },
    { $set: update },
    { new: true, runValidators: true },
  );

  if (!transaction) {
    throw notFound("Transaction not found");
  }

  return toTransaction(transaction);
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<void> {
  const result = await TransactionModel.deleteOne({ _id: transactionId, userId });
  if (result.deletedCount === 0) {
    throw notFound("Transaction not found");
  }
}

export async function findTransactionsForExport(
  userId: string,
  filters: Partial<TransactionFilters>,
) {
  const parsed = {
    page: 1,
    limit: 10000,
    ...filters,
  } as TransactionFilters;

  const query = buildFilter(userId, parsed);
  return TransactionModel.find(query).sort({ date: -1 }).exec();
}
