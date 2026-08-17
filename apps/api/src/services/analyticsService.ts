import type {
  AnalyticsPeriodQuery,
  AnalyticsSummary,
  CategoryBreakdownItem,
  TrendPoint,
} from "@findash/shared";
import { Types } from "mongoose";
import { CategoryModel } from "../models/Category.js";
import { TransactionModel } from "../models/Transaction.js";

function toObjectId(userId: string): Types.ObjectId {
  return new Types.ObjectId(userId);
}

function parsePeriod(query: AnalyticsPeriodQuery) {
  return {
    startDate: new Date(query.startDate),
    endDate: new Date(query.endDate),
  };
}

export async function getSummary(
  userId: string,
  query: AnalyticsPeriodQuery,
): Promise<AnalyticsSummary> {
  const { startDate, endDate } = parsePeriod(query);

  const [result] = await TransactionModel.aggregate<{
    totalIncome: number;
    totalExpense: number;
    transactionCount: number;
  }>([
    {
      $match: {
        userId: toObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const totalIncome = result?.totalIncome ?? 0;
  const totalExpense = result?.totalExpense ?? 0;

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount: result?.transactionCount ?? 0,
  };
}

export async function getCategoryBreakdown(
  userId: string,
  query: AnalyticsPeriodQuery,
): Promise<CategoryBreakdownItem[]> {
  const { startDate, endDate } = parsePeriod(query);

  const breakdown = await TransactionModel.aggregate<{
    _id: string;
    total: number;
  }>([
    {
      $match: {
        userId: toObjectId(userId),
        type: "expense",
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = breakdown.reduce((sum, item) => sum + item.total, 0);
  if (grandTotal === 0) {
    return [];
  }

  const categoryIds = breakdown.map((item) => item._id);
  const categories = await CategoryModel.find({
    _id: { $in: categoryIds },
    userId,
  }).lean();

  const categoryMap = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

  return breakdown.map((item) => ({
    categoryId: item._id.toString(),
    categoryName: categoryMap.get(item._id.toString()) ?? "Unknown",
    total: item.total,
    percentage: Math.round((item.total / grandTotal) * 1000) / 10,
  }));
}

function getDateFormat(granularity: "day" | "week" | "month"): string {
  switch (granularity) {
    case "week":
      return "%G-W%V";
    case "month":
      return "%Y-%m";
    default:
      return "%Y-%m-%d";
  }
}

export async function getTrends(
  userId: string,
  query: AnalyticsPeriodQuery,
): Promise<TrendPoint[]> {
  const { startDate, endDate } = parsePeriod(query);
  const granularity = query.granularity ?? "day";
  const dateFormat = getDateFormat(granularity);

  const points = await TransactionModel.aggregate<{
    _id: string;
    income: number;
    expense: number;
  }>([
    {
      $match: {
        userId: toObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$date" },
        },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return points.map((point) => ({
    date: point._id,
    income: point.income,
    expense: point.expense,
    net: point.income - point.expense,
  }));
}
