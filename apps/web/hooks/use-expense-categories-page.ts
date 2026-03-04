"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type ExpenseCategory } from "@tbms/shared-types";
import { expensesApi } from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormState {
  name: string;
  isActive: boolean;
}

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
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM_STATE);

  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await expensesApi.getCategories();
      if (response.success) {
        setCategories(response.data ?? []);
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
  }, [toast]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(term),
    );
  }, [categories, search]);

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.isActive).length;
    return {
      total: categories.length,
      active,
      inactive: Math.max(0, categories.length - active),
    };
  }, [categories]);

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
    const normalizedName = form.name.trim();
    if (!normalizedName) {
      toast({
        title: "Validation",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await expensesApi.updateCategory(editingCategory.id, {
          name: normalizedName,
          isActive: form.isActive,
        });
        toast({
          title: "Updated",
          description: "Expense category updated.",
        });
      } else {
        await expensesApi.createCategory({
          name: normalizedName,
          isActive: form.isActive,
        });
        toast({
          title: "Created",
          description: "Expense category created.",
        });
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(DEFAULT_FORM_STATE);
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to save expense category."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editingCategory, fetchCategories, form.isActive, form.name, toast]);

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
        await fetchCategories();
      } catch (error) {
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to update category status."),
          variant: "destructive",
        });
      }
    },
    [fetchCategories, toast],
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
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete expense category."),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, fetchCategories, toast]);

  const resetFilters = useCallback(() => {
    setSearch("");
  }, []);

  return {
    loading,
    saving,
    deletingId,
    categories,
    filteredCategories,
    stats,
    search,
    hasActiveFilters,
    dialogOpen,
    editingCategory,
    form,
    deleteTarget,
    setSearch,
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
