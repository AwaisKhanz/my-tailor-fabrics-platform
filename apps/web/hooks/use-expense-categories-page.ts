"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ExpenseCategory,
  type ExpenseCategoryStatsSummary,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useExpenseCategoryDialogManager } from "@/hooks/use-expense-category-dialog-manager";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useDeleteExpenseCategory,
  useExpenseCategoriesPaginated,
  useUpdateExpenseCategory,
} from "@/hooks/queries/expense-queries";
const PAGE_SIZE = 10;
const EMPTY_STATS: ExpenseCategoryStatsSummary = {
  total: 0,
  active: 0,
  inactive: 0,
};

export function useExpenseCategoriesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const debouncedSearch = useDebounce(search, 300);

  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(
    null,
  );
  const categoriesQuery = useExpenseCategoriesPaginated({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
  });
  const updateCategoryMutation = useUpdateExpenseCategory();
  const deleteCategoryMutation = useDeleteExpenseCategory();

  const loading = categoriesQuery.isLoading;
  const categories: ExpenseCategory[] = categoriesQuery.data?.success
    ? (categoriesQuery.data.data.data ?? [])
    : [];
  const total = categoriesQuery.data?.success
    ? (categoriesQuery.data.data.total ?? 0)
    : 0;
  const stats: ExpenseCategoryStatsSummary = categoriesQuery.data?.success
    ? (categoriesQuery.data.data.stats ?? EMPTY_STATS)
    : EMPTY_STATS;

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const fetchCategories = useCallback(
    async (targetPage = page) => {
      try {
        const response = await categoriesQuery.refetch();
        if (response.data?.success) {
          const payload = response.data.data;
          if (
            targetPage > 1 &&
            payload.data.length === 0 &&
            payload.total > 0
          ) {
            setPage(targetPage - 1);
            return;
          }
          if (page !== targetPage) {
            setPage(targetPage);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to load expense categories.",
          ),
          variant: "destructive",
        });
      }
    },
    [categoriesQuery, page, setPage, toast],
  );

  useEffect(() => {
    void fetchCategories(page);
  }, [fetchCategories, page]);

  const hasActiveFilters = Boolean(search.trim());
  const {
    dialogOpen,
    editingCategory,
    fieldErrors,
    form,
    formError,
    saving,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateFormField,
    saveCategory,
  } = useExpenseCategoryDialogManager({
    page,
    onSaved: fetchCategories,
  });

  const toggleCategoryStatus = useCallback(
    async (category: ExpenseCategory) => {
      try {
        await updateCategoryMutation.mutateAsync({
          id: category.id,
          data: {
            isActive: !category.isActive,
          },
        });
        toast({
          title: "Status Updated",
          description: `${category.name} is now ${
            category.isActive ? "inactive" : "active"
          }.`,
        });
        await fetchCategories(page);
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to update category status.",
          ),
          variant: "destructive",
        });
      }
    },
    [fetchCategories, page, toast, updateCategoryMutation],
  );

  const requestDeleteCategory = useCallback((category: ExpenseCategory) => {
    setDeleteTarget(category);
  }, []);

  const closeDeleteDialog = useCallback((open: boolean) => {
    if (!open) {
      setDeleteTarget(null);
    }
  }, []);

  const confirmDeleteCategory = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await deleteCategoryMutation.mutateAsync(deleteTarget.id);
      toast({
        title: "Deleted",
        description: "Expense category removed.",
      });
      setDeleteTarget(null);
      await fetchCategories(page);
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to delete expense category.",
        ),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteCategoryMutation, deleteTarget, fetchCategories, page, toast]);

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  return {
    loading,
    saving,
    deletingId,
    categories,
    total,
    page,
    pageSize,
    stats,
    search,
    hasActiveFilters,
    dialogOpen,
    editingCategory,
    form,
    deleteTarget,
    formError,
    fieldErrors,
    setSearch: setSearchFilter,
    setPage,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateFormField,
    saveCategory,
    toggleCategoryStatus,
    requestDeleteCategory,
    closeDeleteDialog,
    confirmDeleteCategory,
  };
}
