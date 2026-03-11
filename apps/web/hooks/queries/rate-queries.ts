"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratesApi } from "@/lib/api/rates";
import { rateKeys } from "@/lib/query-keys";
import type {
  CreateRateCardInput,
  RateCardsListQueryInput,
  RateStatsQueryInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useRatesList(params: RateCardsListQueryInput = {}) {
  return useQuery({
    queryKey: rateKeys.list(params),
    queryFn: () => ratesApi.findAll(params),
  });
}

export function useRateHistory(
  garmentTypeId: string | null,
  stepKey: string | null,
  branchId?: string | null,
) {
  return useQuery({
    queryKey: rateKeys.history(garmentTypeId ?? "", stepKey ?? "", branchId),
    queryFn: () => ratesApi.getHistory(garmentTypeId!, stepKey!, branchId),
    enabled: !!garmentTypeId && !!stepKey,
  });
}

export function useRateStats(params: RateStatsQueryInput = {}) {
  return useQuery({
    queryKey: rateKeys.stats(params),
    queryFn: () => ratesApi.getStats(params),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRateCardInput) => ratesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rateKeys.all });
    },
  });
}
