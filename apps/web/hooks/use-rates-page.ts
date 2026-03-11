"use client";

import { useCallback, useMemo, useState } from "react";
import {
  rateCardCreateFormSchema,
  type Branch,
  type CreateRateCardInput,
  type GarmentType,
  type RateCardListItem,
  type RateStatsSummary,
} from "@tbms/shared-types";
import { RATE_CARD_GLOBAL_BRANCH_VALUE } from "@/lib/rates";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useDebounce } from "@/hooks/use-debounce";
import { useBranchesList } from "@/hooks/queries/branch-queries";
import { useGarmentTypesList } from "@/hooks/queries/config-queries";
import {
  useCreateRate,
  useRatesList,
  useRateStats,
} from "@/hooks/queries/rate-queries";

const PAGE_SIZE = 10;
const EMPTY_RATE_STATS: RateStatsSummary = {
  total: 0,
  global: 0,
  branchScoped: 0,
};

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeEffectiveFromForSubmit(value: Date | string): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid effective date");
    }

    return value.toISOString();
  }

  const rawValue = value.trim();
  if (!rawValue) {
    throw new Error("Effective date is required");
  }

  if (LOCAL_DATE_PATTERN.test(rawValue)) {
    if (rawValue === toLocalDateString(new Date())) {
      return new Date().toISOString();
    }

    return rawValue;
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid effective date");
  }

  return parsed.toISOString();
}

export function useRatesPage() {
  const { toast } = useToast();
  const { values, setValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const debouncedSearch = useDebounce(search, 300);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRateForAdjust, setSelectedRateForAdjust] =
    useState<RateCardListItem | null>(null);

  const ratesQuery = useRatesList({
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize,
  });
  const statsQuery = useRateStats({
    search: debouncedSearch.trim() || undefined,
  });
  const garmentTypesQuery = useGarmentTypesList({ limit: 100 });
  const branchesQuery = useBranchesList({ page: 1, limit: 100 });
  const createRateMutation = useCreateRate();

  const loading =
    ratesQuery.isLoading ||
    garmentTypesQuery.isLoading ||
    branchesQuery.isLoading ||
    statsQuery.isLoading;
  const rates: RateCardListItem[] = ratesQuery.data?.success
    ? ratesQuery.data.data.data
    : [];
  const total = ratesQuery.data?.success ? ratesQuery.data.data.total : 0;
  const stats: RateStatsSummary = statsQuery.data?.success
    ? statsQuery.data.data
    : EMPTY_RATE_STATS;
  const garmentTypes: GarmentType[] = garmentTypesQuery.data?.success
    ? garmentTypesQuery.data.data.data
    : [];
  const branches: Branch[] = branchesQuery.data?.success
    ? branchesQuery.data.data.data
    : [];

  const stepKeysByGarmentId = useMemo(() => {
    const map: Record<string, string[]> = {};

    for (const garment of garmentTypes) {
      map[garment.id] = (garment.workflowSteps ?? [])
        .filter((step) => step.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((step) => step.stepKey);
    }

    return map;
  }, [garmentTypes]);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        ratesQuery.refetch(),
        garmentTypesQuery.refetch(),
        branchesQuery.refetch(),
        statsQuery.refetch(),
      ]);
    } catch (error) {
      logDevError("Failed to fetch rates data:", error);
      toast({
        title: "Error",
        description: "Failed to load rates",
        variant: "destructive",
      });
    }
  }, [branchesQuery, garmentTypesQuery, ratesQuery, statsQuery, toast]);

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const clearSearch = useCallback(() => {
    setValues({
      search: "",
      page: "1",
    });
  }, [setValues]);

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const createRate = useCallback(
    async (data: CreateRateCardInput) => {
      const normalizedEffectiveFrom = normalizeEffectiveFromForSubmit(
        data.effectiveFrom,
      );
      const parsedResult = rateCardCreateFormSchema.safeParse({
        branchId: data.branchId ?? RATE_CARD_GLOBAL_BRANCH_VALUE,
        garmentTypeId: data.garmentTypeId,
        stepKey: data.stepKey,
        amount: data.amount,
        effectiveFrom: normalizedEffectiveFrom.slice(0, 10),
      });
      if (!parsedResult.success) {
        throw new Error(getFirstZodErrorMessage(parsedResult.error));
      }

      const response = await createRateMutation.mutateAsync({
        ...data,
        effectiveFrom: normalizedEffectiveFrom,
      });
      if (!response.success) {
        throw new Error("Failed to save rate card");
      }

      toast({ title: "Rate card saved successfully" });
      await fetchData();
    },
    [createRateMutation, fetchData, toast],
  );

  const openCreateRateDialog = useCallback(() => {
    setSelectedRateForAdjust(null);
    setCreateDialogOpen(true);
  }, []);

  const openAdjustRateDialog = useCallback((rate: RateCardListItem) => {
    setSelectedRateForAdjust(rate);
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDialogOpenChange = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setSelectedRateForAdjust(null);
    }
  }, []);

  return {
    loading,
    rates,
    total,
    stats,
    page,
    pageSize,
    search,
    hasActiveFilters: Boolean(search.trim()),
    garmentTypes,
    branches,
    createDialogOpen,
    selectedRateForAdjust,
    stepKeysByGarmentId,
    setPage,
    setSearchFilter,
    clearSearch,
    setCreateDialogOpen: handleCreateDialogOpenChange,
    openCreateRateDialog,
    openAdjustRateDialog,
    createRate,
  };
}
