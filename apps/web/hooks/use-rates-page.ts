"use client";

import { useCallback, useEffect, useState } from "react";
import {
  rateCardCreateFormSchema,
  type Branch,
  type CreateRateCardInput,
  type GarmentType,
  type RateCard,
  type RateStatsSummary,
} from "@tbms/shared-types";
import { STEP_KEYS } from "@tbms/shared-constants";
import { branchesApi } from "@/lib/api/branches";
import { configApi } from "@/lib/api/config";
import { ratesApi } from "@/lib/api/rates";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

const PAGE_SIZE = 10;
const EMPTY_RATE_STATS: RateStatsSummary = {
  total: 0,
  global: 0,
  branchScoped: 0,
};

export type RateWithIncludes = RateCard & {
  garmentType?: { name: string };
  branch?: { code: string; name: string } | null;
};

export function useRatesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState<RateWithIncludes[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<RateStatsSummary>(EMPTY_RATE_STATS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesResponse, garmentsResponse, branchesResponse, statsResponse] = await Promise.all([
        ratesApi.findAll({ search: search.trim() || undefined, page, limit: PAGE_SIZE }),
        configApi.getGarmentTypes({ limit: 100 }),
        branchesApi.getBranches({ page: 1, limit: 100 }),
        ratesApi.getStats({ search: search.trim() || undefined }),
      ]);

      if (ratesResponse.success) {
        setRates(ratesResponse.data.data as RateWithIncludes[]);
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
  }, [page, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchData]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  const createRate = useCallback(
    async (data: CreateRateCardInput) => {
      const parsedResult = rateCardCreateFormSchema.safeParse({
        branchId: data.branchId ?? "GLOBAL",
        garmentTypeId: data.garmentTypeId,
        stepKey: data.stepKey,
        amount: data.amount / 100,
        effectiveFrom: data.effectiveFrom,
      });
      if (!parsedResult.success) {
        throw new Error(getFirstZodErrorMessage(parsedResult.error));
      }

      const response = await ratesApi.create(data);
      if (!response.success) {
        throw new Error("Failed to create rate card");
      }

      toast({ title: "Rate card created successfully" });
      await fetchData();
    },
    [fetchData, toast],
  );

  return {
    loading,
    rates,
    total,
    stats,
    page,
    pageSize: PAGE_SIZE,
    search,
    hasActiveFilters: Boolean(search.trim()),
    garmentTypes,
    branches,
    createDialogOpen,
    stepKeys: Object.values(STEP_KEYS),
    setPage,
    setSearchFilter,
    clearSearch,
    setCreateDialogOpen,
    createRate,
  };
}
