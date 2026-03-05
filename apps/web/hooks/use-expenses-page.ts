"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { expenseCreateFormSchema } from "@tbms/shared-types";
import {
  expensesApi,
  type Expense,
  type ExpenseCategory,
} from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

const PAGE_SIZE = 10;

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

const DEFAULT_FILTERS: ExpensesFilters = {
  search: "",
  categoryId: "all",
  from: "",
  to: "",
};

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

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [filters, setFilters] = useState<ExpensesFilters>(DEFAULT_FILTERS);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(getDefaultFormState);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        limit: PAGE_SIZE,
      };

      if (filters.categoryId !== "all") {
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
  }, [filters, page, toast]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  const setCategoryFilter = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, categoryId: value }));
    setPage(1);
  }, []);

  const setSearchFilter = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, search: value }));
    setPage(1);
  }, []);

  const setFromFilter = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, from: value }));
    setPage(1);
  }, []);

  const setToFilter = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, to: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const updateFormField = useCallback(
    <K extends keyof ExpenseFormState>(field: K, value: ExpenseFormState[K]) => {
      setForm((previous) => ({ ...previous, [field]: value }));
    },
    [],
  );

  const openAddDialog = useCallback(() => {
    setAddOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    if (saving) {
      return;
    }
    setAddOpen(false);
  }, [saving]);

  const resetCreateForm = useCallback(() => {
    setForm(getDefaultFormState());
  }, []);

  const submitCreateExpense = useCallback(async () => {
    const parsedResult = expenseCreateFormSchema.safeParse(form);
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    const data = parsedResult.data;
    const amountInPaisa = Math.round(data.amount * 100);

    setSaving(true);
    try {
      const payload: Parameters<typeof expensesApi.createExpense>[0] = {
        categoryId: data.categoryId,
        amount: amountInPaisa,
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
  }, [fetchExpenses, form, page, resetCreateForm, toast]);

  const requestDeleteExpense = useCallback((expense: Expense) => {
    setDeleteTarget(expense);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deletingId) {
      return;
    }
    setDeleteTarget(null);
  }, [deletingId]);

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
        setPage((current) => current - 1);
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
  }, [deleteTarget, expenses?.length, fetchExpenses, page, toast]);

  const listedAmount = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) {
      count += 1;
    }
    if (filters.categoryId !== "all") {
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
    pageSize: PAGE_SIZE,
    categories,
    filters,
    activeFilterCount,
    listedAmount,
    addOpen,
    form,
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
    closeAddDialog,
    submitCreateExpense,
    requestDeleteExpense,
    closeDeleteDialog,
    confirmDeleteExpense,
  };
}
