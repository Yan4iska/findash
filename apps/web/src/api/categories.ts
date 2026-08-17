import type {
  Category,
  CreateCategoryBody,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@findash/shared";
import { apiClient } from "./client.js";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", body);
  return data;
}

export async function updateCategory(
  id: string,
  body: UpdateCategoryBody,
): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function reorderCategories(
  body: ReorderCategoriesBody,
): Promise<Category[]> {
  const { data } = await apiClient.patch<Category[]>(
    "/categories/reorder",
    body,
  );
  return data;
}
