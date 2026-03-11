"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchesApi } from "@/lib/api/branches";
import { branchKeys } from "@/lib/query-keys";
import type {
  BranchListQueryInput,
  CreateBranchInput,
  UpdateBranchInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Slim branch list for the branch switcher header. Long staleTime — changes rarely. */
export function useBranchesSwitcher() {
  return useQuery({
    queryKey: branchKeys.switcher(),
    queryFn: () => branchesApi.getActiveBranchesForSwitcher(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBranchesList(params: BranchListQueryInput = {}) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => branchesApi.getBranches(params),
  });
}

export function useBranch(id: string | null) {
  return useQuery({
    queryKey: branchKeys.detail(id ?? ""),
    queryFn: () => branchesApi.getBranch(id!),
    enabled: !!id,
  });
}

export function useBranchStats() {
  return useQuery({
    queryKey: branchKeys.stats(),
    queryFn: () => branchesApi.getStats(),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchInput) => branchesApi.createBranch(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchInput }) =>
      branchesApi.updateBranch(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: branchKeys.switcher() });
    },
  });
}

export function useRemoveBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesApi.removeBranch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}
