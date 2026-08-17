import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateCategoryBody,
  ReorderCategoriesBody,
  UpdateCategoryBody,
} from "@findash/shared";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  reorderCategories,
  updateCategory,
} from "../api/categories.js";
import { queryKeys } from "./queryKeys.js";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryBody) => createCategory(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryBody }) =>
      updateCategory(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReorderCategoriesBody) => reorderCategories(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}
