import type {
  CreateTransactionBody,
  PaginatedResponse,
  Transaction,
  TransactionFilters,
  UpdateTransactionBody,
} from "@findash/shared";
import { apiClient } from "./client.js";

export async function fetchTransactions(
  filters: Partial<TransactionFilters>,
): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
    "/transactions",
    { params: filters },
  );
  return data;
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
  return data;
}

export async function createTransaction(
  body: CreateTransactionBody,
): Promise<Transaction> {
  const { data } = await apiClient.post<Transaction>("/transactions", body);
  return data;
}

export async function updateTransaction(
  id: string,
  body: UpdateTransactionBody,
): Promise<Transaction> {
  const { data } = await apiClient.put<Transaction>(
    `/transactions/${id}`,
    body,
  );
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/transactions/${id}`);
}

export async function exportTransactionsCsv(
  filters: Partial<TransactionFilters>,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>("/transactions/export.csv", {
    params: filters,
    responseType: "blob",
  });
  return data;
}
