import type {
  CreateRecurringTransactionBody,
  CreateSavingsGoalBody,
  ForecastQuery,
  ForecastResponse,
} from '@findash/shared';
import { Types } from 'mongoose';
import { CategoryModel } from '../models/Category.js';
import {
  RecurringTransactionModel,
  type RecurringTransactionDocument,
} from '../models/RecurringTransaction.js';
import { SavingsGoalModel, type SavingsGoalDocument } from '../models/SavingsGoal.js';
import { TransactionModel } from '../models/Transaction.js';
import { badRequest, notFound } from '../utils/errors.js';

function toRecurring(item: RecurringTransactionDocument) {
  return {
    id: item._id.toString(),
    userId: item.userId.toString(),
    categoryId: item.categoryId.toString(),
    amount: item.amount,
    type: item.type,
    description: item.description,
    frequency: item.frequency,
    nextDate: item.nextDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
function toGoal(item: SavingsGoalDocument) {
  return {
    id: item._id.toString(),
    userId: item.userId.toString(),
    name: item.name,
    targetAmount: item.targetAmount,
    targetDate: item.targetDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
async function assertCategory(userId: string, categoryId: string) {
  if (!(await CategoryModel.exists({ _id: categoryId, userId })))
    throw badRequest('Invalid category');
}

export async function listRecurring(userId: string) {
  return (await RecurringTransactionModel.find({ userId }).sort({ nextDate: 1 })).map(toRecurring);
}
export async function createRecurring(userId: string, body: CreateRecurringTransactionBody) {
  await assertCategory(userId, body.categoryId);
  return toRecurring(
    await RecurringTransactionModel.create({ ...body, userId, nextDate: new Date(body.nextDate) }),
  );
}
export async function deleteRecurring(userId: string, id: string) {
  if (!(await RecurringTransactionModel.deleteOne({ _id: id, userId })).deletedCount)
    throw notFound('Recurring transaction not found');
}
export async function listGoals(userId: string) {
  return (await SavingsGoalModel.find({ userId }).sort({ targetDate: 1 })).map(toGoal);
}
export async function createGoal(userId: string, body: CreateSavingsGoalBody) {
  return toGoal(
    await SavingsGoalModel.create({ ...body, userId, targetDate: new Date(body.targetDate) }),
  );
}
export async function deleteGoal(userId: string, id: string) {
  if (!(await SavingsGoalModel.deleteOne({ _id: id, userId })).deletedCount)
    throw notFound('Savings goal not found');
}

function dayStart(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
function dateKey(date: Date) {
  return dayStart(date).toISOString().slice(0, 10);
}
function nextOccurrence(date: Date, frequency: 'weekly' | 'monthly') {
  const next = new Date(date);
  frequency === 'weekly' ? next.setDate(next.getDate() + 7) : next.setMonth(next.getMonth() + 1);
  return next;
}

export async function getForecast(userId: string, query: ForecastQuery): Promise<ForecastResponse> {
  const today = dayStart(new Date());
  const endOfToday = new Date(today);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const end = new Date(today);
  end.setDate(end.getDate() + query.days);
  const objectUserId = new Types.ObjectId(userId);
  const [balanceResult, recurring, goals] = await Promise.all([
    TransactionModel.aggregate<{ balance: number }>([
      { $match: { userId: objectUserId, date: { $lt: endOfToday } } },
      {
        $group: {
          _id: null,
          balance: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', { $multiply: ['$amount', -1] }],
            },
          },
        },
      },
    ]),
    RecurringTransactionModel.find({ userId }),
    SavingsGoalModel.find({ userId }),
  ]);
  const startingBalance = balanceResult[0]?.balance ?? 0;
  const events = new Map<string, number>();
  for (const item of recurring) {
    for (
      let occurrence = dayStart(item.nextDate);
      occurrence <= end;
      occurrence = nextOccurrence(occurrence, item.frequency)
    ) {
      if (occurrence >= today)
        events.set(
          dateKey(occurrence),
          (events.get(dateKey(occurrence)) ?? 0) +
            (item.type === 'income' ? item.amount : -item.amount),
        );
    }
  }
  let balance = startingBalance;
  const points: ForecastResponse['points'] = [];
  const balanceByDay = new Map<string, number>();
  let firstLowDate: string | undefined;
  for (let offset = 0; offset <= query.days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    balance += events.get(dateKey(date)) ?? 0;
    const iso = date.toISOString();
    points.push({ date: iso, balance });
    balanceByDay.set(dateKey(date), balance);
    if (balance < 0 && !firstLowDate) firstLowDate = iso;
  }
  const projectedGoals = goals.map((goal) => {
    const projectedBalance = balanceByDay.get(dateKey(goal.targetDate)) ?? balance;
    return {
      id: goal._id.toString(),
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate.toISOString(),
      projectedBalance,
      onTrack: projectedBalance >= goal.targetAmount,
    };
  });
  const alerts: ForecastResponse['alerts'] = [];
  if (firstLowDate)
    alerts.push({
      type: 'low_balance',
      date: firstLowDate,
      message: 'Your projected balance falls below zero.',
    });
  for (const goal of projectedGoals.filter((goal) => !goal.onTrack))
    alerts.push({
      type: 'goal_at_risk',
      date: goal.targetDate,
      message: `Your ${goal.name} goal is not funded by its target date.`,
    });
  return { startingBalance, points, alerts, goals: projectedGoals };
}
