"use client";

import { useCallback, useEffect, useState } from "react";
import {
  expenseCategoryFormSchema,
  type ExpenseCategoryFormValues,
  type ExpenseCategory,
  type ExpenseCategoryStatsSummary,
} from "@tbms/shared-types";
import { expensesApi } from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

type CategoryFormState = ExpenseCategoryFormValues;
const PAGE_SIZE = 10;
const EMPTY_STATS: ExpenseCategoryStatsSummary = {
  total: 0,
  active: 0,
  inactive: 0,
};

const DEFAULT_FORM_STATE: CategoryFormState = {
  name: "",
  isActive: true,
};

type ApiError = {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const response = (error as ApiError).response;
  const message = response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message[0] ?? fallback;
  }

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  return fallback;
}

export function useExpenseCategoriesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ExpenseCategoryStatsSummary>(EMPTY_STATS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM_STATE);

  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null);

  const fetchCategories = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const response = await expensesApi.getCategoriesPaginated({
        page: targetPage,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      });
      if (response.success) {
        const payload = response.data;
        if (targetPage > 1 && payload.data.length === 0 && payload.total > 0) {
          setPage(targetPage - 1);
          return;
        }
        setCategories(payload.data ?? []);
        setTotal(payload.total ?? 0);
        setStats(payload.stats ?? EMPTY_STATS);
        if (page !== targetPage) {
          setPage(targetPage);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to load expense categories."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCategories(page);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchCategories, page]);

  const hasActiveFilters = Boolean(search.trim());

  const openCreateDialog = useCallback(() => {
    setEditingCategory(null);
    setForm(DEFAULT_FORM_STATE);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((category: ExpenseCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      isActive: category.isActive,
    });
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(
    (open: boolean) => {
      if (saving) {
        return;
      }
      setDialogOpen(open);
      if (!open) {
        setEditingCategory(null);
        setForm(DEFAULT_FORM_STATE);
      }
    },
    [saving],
  );

  const updateFormField = useCallback(
    <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => {
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const saveCategory = useCallback(async () => {
    const parsedResult = expenseCategoryFormSchema.safeParse(form);
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    const validated = parsedResult.data;

    setSaving(true);
    try {
      if (editingCategory) {
        await expensesApi.updateCategory(editingCategory.id, {
          name: validated.name,
          isActive: validated.isActive,
        });
        toast({
          title: "Updated",
          description: "Expense category updated.",
        });
      } else {
        await expensesApi.createCategory({
          name: validated.name,
          isActive: validated.isActive,
        });
        toast({
          title: "Created",
          description: "Expense category created.",
        });
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(DEFAULT_FORM_STATE);
      await fetchCategories(page);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to save expense category."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editingCategory, fetchCategories, form, page, toast]);

  const toggleCategoryStatus = useCallback(
    async (category: ExpenseCategory) => {
      try {
        await expensesApi.updateCategory(category.id, {
          isActive: !category.isActive,
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
          description: getErrorMessage(error, "Failed to update category status."),
          variant: "destructive",
        });
      }
    },
    [fetchCategories, page, toast],
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
      await expensesApi.deleteCategory(deleteTarget.id);
      toast({
        title: "Deleted",
        description: "Expense category removed.",
      });
      setDeleteTarget(null);
      await fetchCategories(page);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete expense category."),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, fetchCategories, page, toast]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  return {
    loading,
    saving,
    deletingId,
    categories,
    total,
    page,
    pageSize: PAGE_SIZE,
    stats,
    search,
    hasActiveFilters,
    dialogOpen,
    editingCategory,
    form,
    deleteTarget,
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
