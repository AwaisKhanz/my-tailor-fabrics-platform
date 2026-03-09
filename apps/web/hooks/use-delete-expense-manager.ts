"use client";

import { useCallback, useState } from "react";
import { expensesApi, type Expense } from "@/lib/api/expenses";
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
      await expensesApi.deleteExpense(deleteTarget.id);
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
  }, [deleteTarget, expensesCount, page, refreshExpenses, setPage, toast]);

  return {
    deleteTarget,
    deletingId,
    requestDeleteExpense,
    closeDeleteDialog,
    handleDeleteDialogChange,
    confirmDeleteExpense,
  };
}
