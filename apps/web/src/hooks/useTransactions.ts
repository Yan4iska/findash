import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateTransactionBody,
  TransactionFilters,
  UpdateTransactionBody,
} from "@findash/shared";
import {
  createTransaction,
  deleteTransaction,
  exportTransactionsCsv,
  fetchTransaction,
  fetchTransactions,
  updateTransaction,
} from "../api/transactions.js";
import { queryKeys } from "./queryKeys.js";

export function useTransactions(filters: Partial<TransactionFilters> = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => fetchTransactions(filters),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? ""),
    queryFn: () => fetchTransaction(id!),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTransactionBody) => createTransaction(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTransactionBody }) =>
      updateTransaction(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
    },
  });
}

export function useExportTransactions() {
  return useMutation({
    mutationFn: (filters: Partial<TransactionFilters>) =>
      exportTransactionsCsv(filters),
  });
}
