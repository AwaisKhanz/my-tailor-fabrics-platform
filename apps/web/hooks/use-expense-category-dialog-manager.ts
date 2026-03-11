"use client";

import { useCallback, useState } from "react";
import {
  expenseCategoryFormSchema,
  type ExpenseCategoryFormValues,
  type ExpenseCategory,
} from "@tbms/shared-types";
import {
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
} from "@/hooks/queries/expense-queries";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

type CategoryFormState = ExpenseCategoryFormValues;
type CategoryFieldErrors = Partial<Record<keyof CategoryFormState, string>>;

const DEFAULT_FORM_STATE: CategoryFormState = {
  name: "",
  isActive: true,
};

export function useExpenseCategoryDialogManager(params: {
  page: number;
  onSaved: (page: number) => Promise<void>;
}) {
  const { toast } = useToast();
  const createExpenseCategoryMutation = useCreateExpenseCategory();
  const updateExpenseCategoryMutation = useUpdateExpenseCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});
  const saving =
    createExpenseCategoryMutation.isPending ||
    updateExpenseCategoryMutation.isPending;

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
    <K extends keyof CategoryFormState>(
      field: K,
      value: CategoryFormState[K],
    ) => {
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
      setFormError(
        flattenedErrors.name?.[0] ?? "Fix the highlighted field and try again.",
      );
      return;
    }

    const validated = parsedResult.data;
    setFieldErrors({});
    setFormError("");

    try {
      if (editingCategory) {
        await updateExpenseCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: {
            name: validated.name,
            isActive: validated.isActive,
          },
        });
        toast({
          title: "Updated",
          description: "Expense category updated.",
        });
      } else {
        await createExpenseCategoryMutation.mutateAsync({
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
      await params.onSaved(params.page);
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to save expense category.",
        ),
        variant: "destructive",
      });
    }
  }, [
    createExpenseCategoryMutation,
    editingCategory,
    form,
    params,
    toast,
    updateExpenseCategoryMutation,
  ]);

  return {
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
  };
}
