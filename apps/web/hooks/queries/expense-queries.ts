"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "@/lib/api/expenses";
import { expenseKeys } from "@/lib/query-keys";
import type {
  CreateExpenseCategoryInput,
  CreateExpenseInput,
  ExpenseCategoryListQueryInput,
  ExpenseListQueryInput,
  UpdateExpenseCategoryInput,
  UpdateExpenseInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useExpensesList(params: ExpenseListQueryInput = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expensesApi.getExpenses(params),
  });
}

/** Flat category list for select dropdowns. Cached 5 min — categories change rarely. */
export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: () => expensesApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpenseCategoriesPaginated(
  params: ExpenseCategoryListQueryInput = {},
) {
  return useQuery({
    queryKey: expenseKeys.categoriesPaginated(params),
    queryFn: () => expensesApi.getCategoriesPaginated(params),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expensesApi.createExpense(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseCategoryInput) =>
      expensesApi.createCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.categories(),
      });
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.all,
        predicate: (q) => q.queryKey.includes("paginated"),
      });
    },
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExpenseCategoryInput;
    }) => expensesApi.updateCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.categories(),
      });
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.all,
        predicate: (q) => q.queryKey.includes("paginated"),
      });
    },
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.categories(),
      });
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.all,
        predicate: (q) => q.queryKey.includes("paginated"),
      });
    },
  });
}
