"use client";

import { useCallback, useState } from "react";
import type { useToast } from "@/hooks/use-toast";
import { useReversePayment } from "@/hooks/queries/payment-queries";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UsePaymentReversalManagerParams {
  selectedEmployeeId: string;
  refreshPayments: () => Promise<void>;
  toast: ToastFn;
}

export function usePaymentReversalManager({
  selectedEmployeeId,
  refreshPayments,
  toast,
}: UsePaymentReversalManagerParams) {
  const reversePaymentMutation = useReversePayment();
  const [reversingPaymentId, setReversingPaymentId] = useState<string | null>(
    null,
  );
  const [paymentToReverseId, setPaymentToReverseId] = useState<string | null>(
    null,
  );

  const reversePayment = useCallback(
    async (paymentId: string) => {
      if (!selectedEmployeeId) {
        return false;
      }

      setReversingPaymentId(paymentId);
      try {
        await reversePaymentMutation.mutateAsync({
          id: paymentId,
          employeeId: selectedEmployeeId,
        });
        toast({ title: "Payment reversed successfully" });
        await refreshPayments();
        return true;
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to reverse payment",
          ),
          variant: "destructive",
        });
        return false;
      } finally {
        setReversingPaymentId(null);
      }
    },
    [refreshPayments, reversePaymentMutation, selectedEmployeeId, toast],
  );

  const requestReversePayment = useCallback((paymentId: string) => {
    setPaymentToReverseId(paymentId);
  }, []);

  const closeReversePaymentDialog = useCallback((open: boolean) => {
    if (!open) {
      setPaymentToReverseId(null);
    }
  }, []);

  const confirmReversePayment = useCallback(async () => {
    if (!paymentToReverseId) {
      return;
    }

    const reversed = await reversePayment(paymentToReverseId);
    if (reversed) {
      setPaymentToReverseId(null);
    }
  }, [paymentToReverseId, reversePayment]);

  return {
    reversingPaymentId,
    paymentToReverseId,
    requestReversePayment,
    closeReversePaymentDialog,
    confirmReversePayment,
  };
}
