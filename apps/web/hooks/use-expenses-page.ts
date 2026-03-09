"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseCreateFormSchema } from "@tbms/shared-types";
import {
  expensesApi,
  type Expense,
  type ExpenseCategory,
} from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";
import { useUrlTableState } from "@/hooks/use-url-table-state";

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

export interface ExpenseFormState {
  categoryId: string;
  amount: string;
  expenseDate: string;
  description: string;
}
type ExpenseFieldErrors = Partial<Record<keyof ExpenseFormState, string>>;

function getTodayDate() {
  return new Date().toISOString().split("T")[0] ?? "";
}

function getDefaultFormState(): ExpenseFormState {
  return {
    categoryId: "",
    amount: "",
    expenseDate: getTodayDate(),
    description: "",
  };
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

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(getDefaultFormState);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ExpenseFieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await expensesApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expense categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [toast]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
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

      const response = await expensesApi.getExpenses(params);
      if (response.success) {
        setExpenses(response.data.data || []);
        setTotal(response.data.total);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, toast]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  const setCategoryFilter = useCallback((value: string) => {
    setValues({
      categoryId: value,
      page: "1",
    });
  }, [setValues]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const setFromFilter = useCallback((value: string) => {
    setValues({
      from: value,
      page: "1",
    });
  }, [setValues]);

  const setToFilter = useCallback((value: string) => {
    setValues({
      to: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const updateFormField = useCallback(
    <K extends keyof ExpenseFormState>(field: K, value: ExpenseFormState[K]) => {
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
      setFormError("");
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const openAddDialog = useCallback(() => {
    setFieldErrors({});
    setFormError("");
    setAddOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    if (saving) {
      return;
    }
    setFieldErrors({});
    setFormError("");
    setAddOpen(false);
  }, [saving]);

  const handleAddDialogChange = useCallback((open: boolean) => {
    if (open) {
      openAddDialog();
      return;
    }

    closeAddDialog();
  }, [closeAddDialog, openAddDialog]);

  const resetCreateForm = useCallback(() => {
    setForm(getDefaultFormState());
  }, []);

  const submitCreateExpense = useCallback(async () => {
    const parsedResult = expenseCreateFormSchema.safeParse(form);
    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setFieldErrors({
        categoryId: flattenedErrors.categoryId?.[0],
        amount: flattenedErrors.amount?.[0],
        expenseDate: flattenedErrors.expenseDate?.[0],
        description: flattenedErrors.description?.[0],
      });
      setFormError(
        flattenedErrors.categoryId?.[0] ??
          flattenedErrors.amount?.[0] ??
          flattenedErrors.expenseDate?.[0] ??
          flattenedErrors.description?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return;
    }

    const data = parsedResult.data;
    setFieldErrors({});
    setFormError("");

    setSaving(true);
    try {
      const payload: Parameters<typeof expensesApi.createExpense>[0] = {
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description || undefined,
        expenseDate: new Date(data.expenseDate).toISOString(),
      };

      await expensesApi.createExpense(payload);
      toast({ title: "Expense added successfully" });

      setAddOpen(false);
      resetCreateForm();

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchExpenses();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [fetchExpenses, form, page, resetCreateForm, setPage, toast]);

  const requestDeleteExpense = useCallback((expense: Expense) => {
    setDeleteTarget(expense);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deletingId) {
      return;
    }
    setDeleteTarget(null);
  }, [deletingId]);

  const handleDeleteDialogChange = useCallback((open: boolean) => {
    if (!open) {
      closeDeleteDialog();
    }
  }, [closeDeleteDialog]);

  const confirmDeleteExpense = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await expensesApi.deleteExpense(deleteTarget.id);
      toast({ title: "Expense deleted" });
      setDeleteTarget(null);

      if (expenses.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await fetchExpenses();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, expenses?.length, fetchExpenses, page, setPage, toast]);

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
