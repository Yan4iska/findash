import type {
  CreateRecurringTransactionBody,
  CreateSavingsGoalBody,
  ForecastResponse,
  RecurringTransaction,
  SavingsGoal,
} from '@findash/shared';
import { apiClient } from './client.js';

export async function fetchForecast(days: number): Promise<ForecastResponse> {
  return (await apiClient.get('/forecast', { params: { days } })).data;
}
export async function fetchRecurring(): Promise<RecurringTransaction[]> {
  return (await apiClient.get('/forecast/recurring')).data;
}
export async function createRecurring(
  body: CreateRecurringTransactionBody,
): Promise<RecurringTransaction> {
  return (await apiClient.post('/forecast/recurring', body)).data;
}
export async function deleteRecurring(id: string): Promise<void> {
  await apiClient.delete(`/forecast/recurring/${id}`);
}
export async function fetchGoals(): Promise<SavingsGoal[]> {
  return (await apiClient.get('/forecast/goals')).data;
}
export async function createGoal(body: CreateSavingsGoalBody): Promise<SavingsGoal> {
  return (await apiClient.post('/forecast/goals', body)).data;
}
export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/forecast/goals/${id}`);
}
