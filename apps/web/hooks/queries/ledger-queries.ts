"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ledgerApi } from "@/lib/api/ledger";
import { ledgerKeys, employeeKeys } from "@/lib/query-keys";
import type {
  CreateManualLedgerEntryInput,
  LedgerStatementParams,
  ReverseLedgerEntryInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useLedgerBalance(employeeId: string | null) {
  return useQuery({
    queryKey: ledgerKeys.balance(employeeId ?? ""),
    queryFn: () => ledgerApi.getBalance(employeeId!),
    enabled: !!employeeId,
  });
}

export function useLedgerStatement(
  employeeId: string | null,
  params: LedgerStatementParams = {},
) {
  return useQuery({
    queryKey: ledgerKeys.statement(employeeId ?? "", params),
    queryFn: () => ledgerApi.getStatement(employeeId!, params),
    enabled: !!employeeId,
  });
}

export function useLedgerEarnings(employeeId: string | null, weeksBack = 12) {
  return useQuery({
    queryKey: ledgerKeys.earnings(employeeId ?? "", weeksBack),
    queryFn: () => ledgerApi.getEarnings(employeeId!, weeksBack),
    enabled: !!employeeId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateManualLedgerEntryInput) =>
      ledgerApi.createEntry(data),
    onSuccess: (_result, data) => {
      const employeeId = data.employeeId;
      void queryClient.invalidateQueries({
        queryKey: ledgerKeys.balance(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: ledgerKeys.all,
        predicate: (q) => q.queryKey.includes("statement"),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
    },
  });
}

export function useReverseLedgerEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      employeeId,
    }: {
      id: string;
      data?: ReverseLedgerEntryInput;
      /** passed through for targeted cache invalidation */
      employeeId: string;
    }) => ledgerApi.reverseEntry(id, data),
    onSuccess: (_result, { employeeId }) => {
      void queryClient.invalidateQueries({
        queryKey: ledgerKeys.balance(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: ledgerKeys.all,
        predicate: (q) => q.queryKey.includes("statement"),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
    },
  });
}
