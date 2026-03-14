"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configApi } from "@/lib/api/config";
import { configKeys } from "@/lib/query-keys";
import type {
  CreateGarmentTypeInput,
  UpdateGarmentTypeInput,
  UpdateGarmentWorkflowStepsInput,
  CreateMeasurementCategoryInput,
  UpdateMeasurementCategoryInput,
  CreateMeasurementSectionInput,
  UpdateMeasurementSectionInput,
  DeleteMeasurementSectionInput,
  CreateMeasurementFieldInput,
  UpdateMeasurementFieldInput,
  GarmentTypeListQueryInput,
  MeasurementCategoryListQueryInput,
  UpdateSystemSettingsInput,
} from "@tbms/shared-types";

// ─────────────────────────────────────────────────────────────────────────────
// Granular config query keys (kept local — not needed across domains)
// ─────────────────────────────────────────────────────────────────────────────

const garmentTypeKeys = {
  all: ["config", "garmentTypes"] as const,
  list: (params: object) => [...garmentTypeKeys.all, "list", params] as const,
  detail: (id: string) => [...garmentTypeKeys.all, "detail", id] as const,
  stats: () => [...garmentTypeKeys.all, "stats"] as const,
  priceHistory: (id: string) =>
    [...garmentTypeKeys.all, "priceHistory", id] as const,
};

const measurementKeys = {
  all: ["config", "measurements"] as const,
  categories: (params: object) =>
    [...measurementKeys.all, "categories", params] as const,
  category: (id: string) => [...measurementKeys.all, "category", id] as const,
  stats: () => [...measurementKeys.all, "stats"] as const,
};

const systemSettingsKey = ["config", "systemSettings"] as const;

// ─── Garment Types ────────────────────────────────────────────────────────────

export function useGarmentTypesList(params: GarmentTypeListQueryInput = {}) {
  return useQuery({
    queryKey: garmentTypeKeys.list(params),
    queryFn: () => configApi.getGarmentTypes(params),
  });
}

export function useGarmentType(id: string | null) {
  return useQuery({
    queryKey: garmentTypeKeys.detail(id ?? ""),
    queryFn: () => configApi.getGarmentType(id!),
    enabled: !!id,
  });
}

export function useGarmentStats() {
  return useQuery({
    queryKey: garmentTypeKeys.stats(),
    queryFn: () => configApi.getGarmentStats(),
  });
}

export function useGarmentPriceHistory(garmentTypeId: string | null) {
  return useQuery({
    queryKey: garmentTypeKeys.priceHistory(garmentTypeId ?? ""),
    queryFn: () => configApi.getGarmentPriceHistory(garmentTypeId!),
    enabled: !!garmentTypeId,
  });
}

export function useCreateGarmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGarmentTypeInput) =>
      configApi.createGarmentType(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: garmentTypeKeys.all });
    },
  });
}

export function useUpdateGarmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGarmentTypeInput }) =>
      configApi.updateGarmentType(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: garmentTypeKeys.detail(id),
      });
      void queryClient.invalidateQueries({ queryKey: garmentTypeKeys.all });
    },
  });
}

export function useDeleteGarmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, preview = false }: { id: string; preview?: boolean }) =>
      configApi.deleteGarmentType(id, preview),
    onSuccess: (_result, { preview }) => {
      if (!preview) {
        void queryClient.invalidateQueries({ queryKey: garmentTypeKeys.all });
      }
    },
  });
}

export function useRestoreGarmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => configApi.restoreGarmentType(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: garmentTypeKeys.all });
    },
  });
}

export function useUpdateGarmentWorkflowSteps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      steps,
    }: {
      id: string;
      steps: UpdateGarmentWorkflowStepsInput["steps"];
    }) => configApi.updateGarmentWorkflowSteps(id, steps),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: garmentTypeKeys.detail(id),
      });
    },
  });
}

export function useRestoreGarmentWorkflowStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      garmentTypeId,
      stepKey,
    }: {
      garmentTypeId: string;
      stepKey: string;
    }) => configApi.restoreGarmentWorkflowStep(garmentTypeId, stepKey),
    onSuccess: (_result, { garmentTypeId }) => {
      void queryClient.invalidateQueries({
        queryKey: garmentTypeKeys.detail(garmentTypeId),
      });
    },
  });
}

// ─── Measurement Categories ───────────────────────────────────────────────────

export function useMeasurementCategories(
  params: MeasurementCategoryListQueryInput = {},
) {
  return useQuery({
    queryKey: measurementKeys.categories(params),
    queryFn: () => configApi.getMeasurementCategories(params),
  });
}

export function useMeasurementCategory(
  id: string | null,
  options?: { includeArchived?: boolean },
) {
  return useQuery({
    queryKey: [...measurementKeys.category(id ?? ""), options ?? {}],
    queryFn: () => configApi.getMeasurementCategory(id!, options),
    enabled: !!id,
  });
}

export function useMeasurementStats() {
  return useQuery({
    queryKey: measurementKeys.stats(),
    queryFn: () => configApi.getMeasurementStats(),
  });
}

export function useCreateMeasurementCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeasurementCategoryInput) =>
      configApi.createMeasurementCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

export function useUpdateMeasurementCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMeasurementCategoryInput;
    }) => configApi.updateMeasurementCategory(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(id),
      });
      void queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

export function useDeleteMeasurementCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, preview = false }: { id: string; preview?: boolean }) =>
      configApi.deleteMeasurementCategory(id, preview),
    onSuccess: (_result, { preview }) => {
      if (!preview) {
        void queryClient.invalidateQueries({ queryKey: measurementKeys.all });
      }
    },
  });
}

export function useRestoreMeasurementCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => configApi.restoreMeasurementCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: measurementKeys.all });
    },
  });
}

// ─── Measurement Sections ─────────────────────────────────────────────────────

export function useAddMeasurementSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: CreateMeasurementSectionInput;
    }) => configApi.addMeasurementSection(categoryId, data),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

export function useUpdateMeasurementSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
      categoryId,
    }: {
      sectionId: string;
      data: UpdateMeasurementSectionInput;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.updateMeasurementSection(sectionId, data),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

export function useDeleteMeasurementSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
      preview = false,
    }: {
      sectionId: string;
      data?: DeleteMeasurementSectionInput;
      preview?: boolean;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.deleteMeasurementSection(sectionId, data, preview),
    onSuccess: (_result, { categoryId, preview }) => {
      if (!preview) {
        void queryClient.invalidateQueries({
          queryKey: measurementKeys.category(categoryId),
        });
      }
    },
  });
}

export function useRestoreMeasurementSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      categoryId,
    }: {
      sectionId: string;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.restoreMeasurementSection(sectionId),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

// ─── Measurement Fields ───────────────────────────────────────────────────────

export function useAddMeasurementField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: CreateMeasurementFieldInput;
    }) => configApi.addMeasurementField(categoryId, data),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

export function useUpdateMeasurementField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      data,
      categoryId,
    }: {
      fieldId: string;
      data: UpdateMeasurementFieldInput;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.updateMeasurementField(fieldId, data),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

export function useDeleteMeasurementField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      preview = false,
      categoryId,
    }: {
      fieldId: string;
      preview?: boolean;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.deleteMeasurementField(fieldId, preview),
    onSuccess: (_result, { categoryId, preview }) => {
      if (!preview) {
        void queryClient.invalidateQueries({
          queryKey: measurementKeys.category(categoryId),
        });
      }
    },
  });
}

export function useRestoreMeasurementField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      categoryId,
    }: {
      fieldId: string;
      /** passed through for cache invalidation */
      categoryId: string;
    }) => configApi.restoreMeasurementField(fieldId),
    onSuccess: (_result, { categoryId }) => {
      void queryClient.invalidateQueries({
        queryKey: measurementKeys.category(categoryId),
      });
    },
  });
}

// ─── System Settings ──────────────────────────────────────────────────────────

export function useSystemSettings(enabled = true) {
  return useQuery({
    queryKey: systemSettingsKey,
    queryFn: () => configApi.getSystemSettings(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSystemSettingsInput) =>
      configApi.updateSystemSettings(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: systemSettingsKey });
      void queryClient.invalidateQueries({ queryKey: configKeys.all });
    },
  });
}
