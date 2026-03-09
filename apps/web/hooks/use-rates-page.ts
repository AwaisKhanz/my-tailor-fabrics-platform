"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  rateCardCreateFormSchema,
  type Branch,
  type CreateRateCardInput,
  type GarmentType,
  type RateCardListItem,
  type RateStatsSummary,
} from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { configApi } from "@/lib/api/config";
import { ratesApi } from "@/lib/api/rates";
import {
  RATE_CARD_GLOBAL_BRANCH_VALUE,
} from "@/lib/rates";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";
import { useUrlTableState } from "@/hooks/use-url-table-state";

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

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RateCardListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<RateStatsSummary>(EMPTY_RATE_STATS);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;

  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRateForAdjust, setSelectedRateForAdjust] = useState<RateCardListItem | null>(
    null,
  );

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
    setLoading(true);
    try {
      const [ratesResponse, garmentsResponse, branchesResponse, statsResponse] = await Promise.all([
        ratesApi.findAll({ search: search.trim() || undefined, page, limit: pageSize }),
        configApi.getGarmentTypes({ limit: 100 }),
        branchesApi.getBranches({ page: 1, limit: 100 }),
        ratesApi.getStats({ search: search.trim() || undefined }),
      ]);

      if (ratesResponse.success) {
        setRates(ratesResponse.data.data);
        setTotal(ratesResponse.data.total);
      }

      if (garmentsResponse.success && garmentsResponse.data) {
        setGarmentTypes(garmentsResponse.data.data);
      }

      if (branchesResponse.success && branchesResponse.data) {
        setBranches(branchesResponse.data.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      logDevError("Failed to fetch rates data:", error);
      toast({
        title: "Error",
        description: "Failed to load rates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchData]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const clearSearch = useCallback(() => {
    setValues({
      search: "",
      page: "1",
    });
  }, [setValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const createRate = useCallback(
    async (data: CreateRateCardInput) => {
      const normalizedEffectiveFrom = normalizeEffectiveFromForSubmit(data.effectiveFrom);
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

      const response = await ratesApi.create({
        ...data,
        effectiveFrom: normalizedEffectiveFrom,
      });
      if (!response.success) {
        throw new Error("Failed to save rate card");
      }

      toast({ title: "Rate card saved successfully" });
      await fetchData();
    },
    [fetchData, toast],
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
