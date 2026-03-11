"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { paymentKeys, employeeKeys, ledgerKeys } from "@/lib/query-keys";
import type {
  DisbursePaymentInput,
  GenerateSalaryAccrualsInput,
  PaymentHistoryQueryInput,
  ReversePaymentInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useEmployeePaymentSummary(employeeId: string | null) {
  return useQuery({
    queryKey: paymentKeys.summary(employeeId ?? ""),
    queryFn: () => paymentsApi.getEmployeeSummary(employeeId!),
    enabled: !!employeeId,
  });
}

export function usePaymentHistory(
  employeeId: string | null,
  params: PaymentHistoryQueryInput = {},
) {
  return useQuery({
    queryKey: paymentKeys.history(employeeId ?? "", params),
    queryFn: () => paymentsApi.getPaymentHistory(employeeId!, params),
    enabled: !!employeeId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDisbursePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DisbursePaymentInput) => paymentsApi.disburse(data),
    onSuccess: (_result, data) => {
      const employeeId = data.employeeId;
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.summary(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
        predicate: (q) => q.queryKey.includes("history"),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}

export function useReversePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      employeeId,
    }: {
      id: string;
      data?: ReversePaymentInput;
      /** passed through for targeted cache invalidation */
      employeeId: string;
    }) => paymentsApi.reverse(id, data),
    onSuccess: (_result, { employeeId }) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.summary(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
        predicate: (q) => q.queryKey.includes("history"),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}

export function useGenerateSalaryAccruals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateSalaryAccrualsInput) =>
      paymentsApi.generateSalaryAccruals(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
    },
  });
}

export function useWeeklyReportPdf() {
  return useMutation({
    mutationFn: () => paymentsApi.getWeeklyReportPdf(),
  });
}
