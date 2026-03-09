"use client";

import { useCallback, useState } from "react";
import { expenseCreateFormSchema } from "@tbms/shared-types";
import { expensesApi } from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";

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

interface UseCreateExpenseManagerParams {
  page: number;
  setPage: (page: number) => void;
  refreshExpenses: () => Promise<void>;
}

export function useCreateExpenseManager({
  page,
  setPage,
  refreshExpenses,
}: UseCreateExpenseManagerParams) {
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(getDefaultFormState);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ExpenseFieldErrors>({});
  const [saving, setSaving] = useState(false);

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

  const handleAddDialogChange = useCallback(
    (open: boolean) => {
      if (open) {
        openAddDialog();
        return;
      }

      closeAddDialog();
    },
    [closeAddDialog, openAddDialog],
  );

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
        await refreshExpenses();
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
  }, [form, page, refreshExpenses, resetCreateForm, setPage, toast]);

  return {
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
  };
}
