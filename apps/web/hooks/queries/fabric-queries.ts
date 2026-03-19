"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateShopFabricInput,
  ShopFabricListQueryInput,
  UpdateShopFabricInput,
} from "@tbms/shared-types";
import { fabricsApi } from "@/lib/api/fabrics";
import { fabricKeys } from "@/lib/query-keys";

export function useShopFabricsList(params: ShopFabricListQueryInput = {}) {
  return useQuery({
    queryKey: fabricKeys.list(params),
    queryFn: () => fabricsApi.findAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useShopFabric(id: string | null) {
  return useQuery({
    queryKey: fabricKeys.detail(id ?? ""),
    queryFn: () => fabricsApi.findOne(id!),
    enabled: Boolean(id),
  });
}

export function useShopFabricStats(params: Pick<ShopFabricListQueryInput, "search"> = {}) {
  return useQuery({
    queryKey: fabricKeys.stats(params),
    queryFn: () => fabricsApi.getStats(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateShopFabric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShopFabricInput) => fabricsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fabricKeys.all });
    },
  });
}

export function useUpdateShopFabric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShopFabricInput }) =>
      fabricsApi.update(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: fabricKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: fabricKeys.all });
    },
  });
}
