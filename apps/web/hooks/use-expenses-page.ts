"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Expense } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { useCreateExpenseManager } from "@/hooks/use-create-expense-manager";
import { useDeleteExpenseManager } from "@/hooks/use-delete-expense-manager";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useExpenseCategories,
  useExpensesList,
} from "@/hooks/queries/expense-queries";

const PAGE_SIZE = 10;
export const EXPENSES_ALL_CATEGORIES_FILTER = "all";
export const EXPENSES_ALL_CATEGORIES_LABEL = "All Categories";

type ExpenseFilterOption = {
  value: string;
  label: string;
};

interface ExpensesFilterParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export interface ExpensesFilters {
  search: string;
  categoryId: string;
  from: string;
  to: string;
}

export function useExpensesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      categoryId: EXPENSES_ALL_CATEGORIES_FILTER,
      from: "",
      to: "",
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const filters = useMemo<ExpensesFilters>(
    () => ({
      search: values.search,
      categoryId: values.categoryId || EXPENSES_ALL_CATEGORIES_FILTER,
      from: values.from,
      to: values.to,
    }),
    [values.categoryId, values.from, values.search, values.to],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const expenseParams = useMemo<ExpensesFilterParams>(() => {
    const params: ExpensesFilterParams = {
      page,
      limit: pageSize,
    };

    if (filters.categoryId !== EXPENSES_ALL_CATEGORIES_FILTER) {
      params.categoryId = filters.categoryId;
    }
    if (filters.search.trim()) {
      params.search = filters.search.trim();
    }
    if (filters.from) {
      params.from = filters.from;
    }
    if (filters.to) {
      params.to = filters.to;
    }

    return params;
  }, [filters, page, pageSize]);

  const categoriesQuery = useExpenseCategories();
  const expensesQuery = useExpensesList(expenseParams);

  const loading = expensesQuery.isLoading;
  const categoriesLoading = categoriesQuery.isLoading;
  const expenses: Expense[] = expensesQuery.data?.success
    ? expensesQuery.data.data.data || []
    : [];
  const total = expensesQuery.data?.success ? expensesQuery.data.data.total : 0;
  const categories = categoriesQuery.data?.success
    ? categoriesQuery.data.data
    : [];

  const fetchExpenses = useCallback(async () => {
    try {
      await expensesQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    }
  }, [expensesQuery, toast]);

  useEffect(() => {
    if (categoriesQuery.isError) {
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive",
      });
    }
  }, [categoriesQuery.isError, toast]);

  const setCategoryFilter = useCallback(
    (value: string) => {
      setValues({
        categoryId: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setFromFilter = useCallback(
    (value: string) => {
      setValues({
        from: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setToFilter = useCallback(
    (value: string) => {
      setValues({
        to: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const {
    addOpen,
    form,
    formError,
    fieldErrors,
    saving,
    updateFormField,
    openAddDialog,
    handleAddDialogChange,
    closeAddDialog,
    submitCreateExpense,
  } = useCreateExpenseManager({
    page,
    setPage,
    refreshExpenses: fetchExpenses,
  });

  const {
    deleteTarget,
    deletingId,
    requestDeleteExpense,
    closeDeleteDialog,
    handleDeleteDialogChange,
    confirmDeleteExpense,
  } = useDeleteExpenseManager({
    expensesCount: expenses.length,
    page,
    setPage,
    refreshExpenses: fetchExpenses,
  });

  const listedAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const categoryFilterOptions = useMemo<ExpenseFilterOption[]>(
    () => [
      {
        value: EXPENSES_ALL_CATEGORIES_FILTER,
        label: EXPENSES_ALL_CATEGORIES_LABEL,
      },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    ],
    [categories],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) {
      count += 1;
    }
    if (filters.categoryId !== EXPENSES_ALL_CATEGORIES_FILTER) {
      count += 1;
    }
    if (filters.from) {
      count += 1;
    }
    if (filters.to) {
      count += 1;
    }
    return count;
  }, [filters]);

  return {
    loading,
    categoriesLoading,
    expenses,
    total,
    page,
    pageSize,
    categories,
    categoryFilterOptions,
    filters,
    activeFilterCount,
    listedAmount,
    addOpen,
    form,
    formError,
    fieldErrors,
    saving,
    deleteTarget,
    deletingId,
    setPage,
    setSearchFilter,
    setCategoryFilter,
    setFromFilter,
    setToFilter,
    resetFilters,
    updateFormField,
    openAddDialog,
    handleAddDialogChange,
    closeAddDialog,
    submitCreateExpense,
    requestDeleteExpense,
    closeDeleteDialog,
    handleDeleteDialogChange,
    confirmDeleteExpense,
  };
}
