"use client";

import { useCallback, useState } from "react";
import type { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api/payments";
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
        await paymentsApi.reverse(paymentId);
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
    [refreshPayments, selectedEmployeeId, toast],
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
