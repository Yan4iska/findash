import type { TransactionFilters } from "@findash/shared";
import { CategoryModel } from "../models/Category.js";
import { findTransactionsForExport } from "./transactionService.js";

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function buildTransactionsCsv(
  userId: string,
  filters: Partial<TransactionFilters>,
): Promise<string> {
  const transactions = await findTransactionsForExport(userId, filters);
  const categoryIds = [...new Set(transactions.map((t) => t.categoryId.toString()))];
  const categories = await CategoryModel.find({
    _id: { $in: categoryIds },
    userId,
  }).lean();

  const categoryMap = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

  const header = ["date", "type", "amount", "category", "description"];
  const rows = transactions.map((transaction) => [
    transaction.date.toISOString(),
    transaction.type,
    transaction.amount.toString(),
    categoryMap.get(transaction.categoryId.toString()) ?? "",
    transaction.description ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");
}
