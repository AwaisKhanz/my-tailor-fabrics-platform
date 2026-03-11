"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Branch,
  type CreateRateCardInput,
  type GarmentTypeWithAnalytics,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { useBranchesList } from "@/hooks/queries/branch-queries";
import { useGarmentType } from "@/hooks/queries/config-queries";
import { useCreateRate } from "@/hooks/queries/rate-queries";

interface UseGarmentDetailPageParams {
  garmentId: string | null;
}

export function useGarmentDetailPage({
  garmentId,
}: UseGarmentDetailPageParams) {
  const { toast } = useToast();
  const garmentQuery = useGarmentType(garmentId);
  const branchesQuery = useBranchesList({ page: 1, limit: 100 });
  const createRateMutation = useCreateRate();

  const loading = garmentQuery.isLoading || branchesQuery.isLoading;
  const garment: GarmentTypeWithAnalytics | null = garmentQuery.data?.success
    ? garmentQuery.data.data
    : null;
  const branches: Branch[] = branchesQuery.data?.success
    ? branchesQuery.data.data.data
    : [];

  const [createRateDialogOpen, setCreateRateDialogOpen] = useState(false);

  const fetchGarment = useCallback(async () => {
    if (!garmentId) {
      return;
    }

    const response = await garmentQuery.refetch();
    if (response.data?.success) {
      return;
    }

    throw new Error("Failed to load garment details");
  }, [garmentId, garmentQuery]);

  const fetchBranches = useCallback(async () => {
    await branchesQuery.refetch();
  }, [branchesQuery]);

  const fetchGarmentDetailPageData = useCallback(async () => {
    if (!garmentId) {
      return;
    }

    try {
      await Promise.all([fetchGarment(), fetchBranches()]);
    } catch (error) {
      logDevError("Failed to fetch garment detail page data", error);
      toast({
        title: "Error",
        description: "Unable to load garment details right now",
        variant: "destructive",
      });
    }
  }, [fetchBranches, fetchGarment, garmentId, toast]);

  useEffect(() => {
    if (!garmentId || !garmentQuery.isError) {
      return;
    }
    toast({
      title: "Error",
      description: "Unable to load garment details right now",
      variant: "destructive",
    });
  }, [garmentId, garmentQuery.isError, toast]);

  const handleCreateRate = useCallback(
    async (data: CreateRateCardInput) => {
      const response = await createRateMutation.mutateAsync(data);

      if (!response.success) {
        throw new Error("Failed to create rate");
      }

      toast({ title: "Rate updated successfully" });
      await fetchGarment();
    },
    [createRateMutation, fetchGarment, toast],
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
