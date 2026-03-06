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
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";

type CategoryFormState = ExpenseCategoryFormValues;
type CategoryFieldErrors = Partial<Record<keyof CategoryFormState, string>>;
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

export function useExpenseCategoriesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ExpenseCategoryStatsSummary>(EMPTY_STATS);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});

  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const fetchCategories = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const response = await expensesApi.getCategoriesPaginated({
        page: targetPage,
        limit: pageSize,
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
        description: getApiErrorMessageOrFallback(error, "Failed to load expense categories."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, setPage, toast]);

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
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((category: ExpenseCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      isActive: category.isActive,
    });
    setFieldErrors({});
    setFormError("");
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
        setFieldErrors({});
        setFormError("");
      }
    },
    [saving],
  );

  const updateFormField = useCallback(
    <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => {
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
      setFormError("");
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const saveCategory = useCallback(async () => {
    const parsedResult = expenseCategoryFormSchema.safeParse(form);
    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setFieldErrors({
        name: flattenedErrors.name?.[0],
      });
      setFormError(flattenedErrors.name?.[0] ?? "Fix the highlighted field and try again.");
      return;
    }

    const validated = parsedResult.data;
    setFieldErrors({});
    setFormError("");

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
        description: getApiErrorMessageOrFallback(error, "Failed to save expense category."),
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
          description: getApiErrorMessageOrFallback(error, "Failed to update category status."),
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
        description: getApiErrorMessageOrFallback(error, "Failed to delete expense category."),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, fetchCategories, page, toast]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

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
