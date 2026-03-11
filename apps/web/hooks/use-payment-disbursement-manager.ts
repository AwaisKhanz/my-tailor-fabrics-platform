"use client";

import { useCallback, useState } from "react";
import type { useToast } from "@/hooks/use-toast";
import { useDisbursePayment } from "@/hooks/queries/payment-queries";
import { paymentDisbursementFormSchema } from "@tbms/shared-types";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { toPaisaFromRupees } from "@/lib/utils/money";

export interface PaymentDisbursementForm {
  amount: string;
  note: string;
}

const DEFAULT_DISBURSEMENT_FORM: PaymentDisbursementForm = {
  amount: "",
  note: "",
};

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UsePaymentDisbursementManagerParams {
  selectedEmployeeId: string;
  currentBalance: number;
  refreshPayments: () => Promise<void>;
  toast: ToastFn;
}

export function usePaymentDisbursementManager({
  selectedEmployeeId,
  currentBalance,
  refreshPayments,
  toast,
}: UsePaymentDisbursementManagerParams) {
  const disbursePaymentMutation = useDisbursePayment();
  const [disburseOpen, setDisburseOpen] = useState(false);
  const [disburseForm, setDisburseForm] = useState<PaymentDisbursementForm>(
    DEFAULT_DISBURSEMENT_FORM,
  );
  const [disburseValidationError, setDisburseValidationError] = useState<
    string | null
  >(null);
  const disbursing = disbursePaymentMutation.isPending;

  const openDisburseDialog = useCallback(() => {
    setDisburseValidationError(null);
    setDisburseOpen(true);
  }, []);

  const closeDisburseDialog = useCallback(
    (open: boolean) => {
      setDisburseOpen(open);
      if (!open && !disbursing) {
        setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
        setDisburseValidationError(null);
      }
    },
    [disbursing],
  );

  const setDisbursementAmount = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, amount: value }));
    setDisburseValidationError(null);
  }, []);

  const setDisbursementNote = useCallback((value: string) => {
    setDisburseForm((previous) => ({ ...previous, note: value }));
    setDisburseValidationError(null);
  }, []);

  const submitDisbursement = useCallback(async () => {
    const parsedResult = paymentDisbursementFormSchema.safeParse({
      amount: disburseForm.amount,
      note: disburseForm.note,
    });
    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0]?.message;
      setDisburseValidationError(
        firstIssue ?? "Please complete required fields.",
      );
      return;
    }

    setDisburseValidationError(null);

    const amountInPaisa = toPaisaFromRupees(parsedResult.data.amount);

    if (amountInPaisa > currentBalance) {
      setDisburseValidationError(
        "Disbursement amount cannot be greater than the outstanding payable balance.",
      );
      return;
    }

    try {
      await disbursePaymentMutation.mutateAsync({
        employeeId: selectedEmployeeId,
        amount: parsedResult.data.amount,
        note: parsedResult.data.note || undefined,
      });

      toast({ title: "Payment disbursed successfully" });
      setDisburseOpen(false);
      setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
      setDisburseValidationError(null);
      await refreshPayments();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to disburse payment",
        ),
        variant: "destructive",
      });
    }
  }, [
    currentBalance,
    disbursePaymentMutation,
    disburseForm.amount,
    disburseForm.note,
    refreshPayments,
    selectedEmployeeId,
    toast,
  ]);

  const resetDisbursement = useCallback(() => {
    setDisburseOpen(false);
    setDisburseForm(DEFAULT_DISBURSEMENT_FORM);
    setDisburseValidationError(null);
  }, []);

  return {
    disburseOpen,
    disburseForm,
    disburseValidationError,
    disbursing,
    openDisburseDialog,
    closeDisburseDialog,
    setDisbursementAmount,
    setDisbursementNote,
    submitDisbursement,
    resetDisbursement,
  };
}
