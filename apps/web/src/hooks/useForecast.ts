import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateRecurringTransactionBody, CreateSavingsGoalBody } from '@findash/shared';
import {
  createGoal,
  createRecurring,
  deleteGoal,
  deleteRecurring,
  fetchForecast,
  fetchGoals,
  fetchRecurring,
} from '../api/forecast.js';
import { queryKeys } from './queryKeys.js';

export function useForecast(days: number) {
  return useQuery({ queryKey: queryKeys.forecast.data(days), queryFn: () => fetchForecast(days) });
}
export function useRecurring() {
  return useQuery({ queryKey: queryKeys.forecast.recurring, queryFn: fetchRecurring });
}
export function useGoals() {
  return useQuery({ queryKey: queryKeys.forecast.goals, queryFn: fetchGoals });
}
function useForecastMutation<T>(mutationFn: (data: T) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.forecast.all });
    },
  });
}
export function useCreateRecurring() {
  return useForecastMutation((body: CreateRecurringTransactionBody) => createRecurring(body));
}
export function useDeleteRecurring() {
  return useForecastMutation((id: string) => deleteRecurring(id));
}
export function useCreateGoal() {
  return useForecastMutation((body: CreateSavingsGoalBody) => createGoal(body));
}
export function useDeleteGoal() {
  return useForecastMutation((id: string) => deleteGoal(id));
}
