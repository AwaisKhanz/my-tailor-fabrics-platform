"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designTypesApi } from "@/lib/api/design-types";
import { designTypeKeys } from "@/lib/query-keys";
import type {
  CreateDesignTypeInput,
  DesignTypesQueryInput,
  UpdateDesignTypeInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDesignTypesList(params: DesignTypesQueryInput = {}) {
  return useQuery({
    queryKey: designTypeKeys.list(params),
    queryFn: () => designTypesApi.findAll(params),
    staleTime: 2 * 60 * 1000, // Design types change infrequently
  });
}

export function useDesignType(id: string | null) {
  return useQuery({
    queryKey: designTypeKeys.detail(id ?? ""),
    queryFn: () => designTypesApi.findOne(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateDesignType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDesignTypeInput) => designTypesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: designTypeKeys.all });
    },
  });
}

export function useUpdateDesignType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDesignTypeInput }) =>
      designTypesApi.update(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: designTypeKeys.detail(id),
      });
      void queryClient.invalidateQueries({ queryKey: designTypeKeys.all });
    },
  });
}

export function useDeleteDesignType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designTypesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: designTypeKeys.all });
    },
  });
}
