"use client";

import { useCallback, useState } from "react";
import type { Expense } from "@tbms/shared-types";
import { useDeleteExpense } from "@/hooks/queries/expense-queries";
import { useToast } from "@/hooks/use-toast";

interface UseDeleteExpenseManagerParams {
  expensesCount: number;
  page: number;
  setPage: (page: number) => void;
  refreshExpenses: () => Promise<void>;
}

export function useDeleteExpenseManager({
  expensesCount,
  page,
  setPage,
  refreshExpenses,
}: UseDeleteExpenseManagerParams) {
  const { toast } = useToast();
  const deleteExpenseMutation = useDeleteExpense();
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const requestDeleteExpense = useCallback((expense: Expense) => {
    setDeleteTarget(expense);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deletingId) {
      return;
    }
    setDeleteTarget(null);
  }, [deletingId]);

  const handleDeleteDialogChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDeleteDialog();
      }
    },
    [closeDeleteDialog],
  );

  const confirmDeleteExpense = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.id);
    try {
      await deleteExpenseMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Expense deleted" });
      setDeleteTarget(null);

      if (expensesCount === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await refreshExpenses();
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
  }, [
    deleteExpenseMutation,
    deleteTarget,
    expensesCount,
    page,
    refreshExpenses,
    setPage,
    toast,
  ]);

  return {
    deleteTarget,
    deletingId,
    requestDeleteExpense,
    closeDeleteDialog,
    handleDeleteDialogChange,
    confirmDeleteExpense,
  };
}
