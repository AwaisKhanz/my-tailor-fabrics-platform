"use client";

import { useCallback, useEffect, useState } from "react";
import { type Branch, type CreateRateCardInput, type GarmentTypeWithAnalytics } from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { configApi } from "@/lib/api/config";
import { ratesApi } from "@/lib/api/rates";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";

interface UseGarmentDetailPageParams {
  garmentId: string | null;
}

export function useGarmentDetailPage({ garmentId }: UseGarmentDetailPageParams) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [garment, setGarment] = useState<GarmentTypeWithAnalytics | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [createRateDialogOpen, setCreateRateDialogOpen] = useState(false);

  const fetchGarment = useCallback(async () => {
    if (!garmentId) {
      setGarment(null);
      return;
    }

    const response = await configApi.getGarmentType(garmentId);
    if (response.success) {
      setGarment(response.data);
      return;
    }

    setGarment(null);
    throw new Error("Failed to load garment details");
  }, [garmentId]);

  const fetchBranches = useCallback(async () => {
    const response = await branchesApi.getBranches({ page: 1, limit: 100 });
    if (response.success && response.data) {
      setBranches(response.data.data);
    }
  }, []);

  const fetchGarmentDetailPageData = useCallback(async () => {
    if (!garmentId) {
      setLoading(false);
      setGarment(null);
      return;
    }

    setLoading(true);
    try {
      await Promise.all([fetchGarment(), fetchBranches()]);
    } catch (error) {
      logDevError("Failed to fetch garment detail page data", error);
      toast({
        title: "Error",
        description: "Unable to load garment details right now",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchBranches, fetchGarment, garmentId, toast]);

  useEffect(() => {
    void fetchGarmentDetailPageData();
  }, [fetchGarmentDetailPageData]);

  const handleCreateRate = useCallback(
    async (data: CreateRateCardInput) => {
      const response = await ratesApi.create(data);

      if (!response.success) {
        throw new Error("Failed to create rate");
      }

      toast({ title: "Rate updated successfully" });
      await fetchGarment();
    },
    [fetchGarment, toast],
  );

  return {
    loading,
    garment,
    branches,
    createRateDialogOpen,
    setCreateRateDialogOpen,
    fetchGarmentDetailPageData,
    handleCreateRate,
  };
}
