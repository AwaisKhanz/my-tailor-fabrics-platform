"use client";

import { useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { useBranch } from "@/hooks/queries/branch-queries";

export function useBranchHubConfigPage(branchId: string) {
  const { toast } = useToast();
  const branchQuery = useBranch(branchId);

  const loading = branchQuery.isLoading;
  const branch = branchQuery.data?.success ? branchQuery.data.data : null;

  const fetchBranch = useCallback(async () => {
    try {
      await branchQuery.refetch();
    } catch (error) {
      logDevError("Failed to fetch branch hub config:", error);
      toast({
        title: "Error",
        description: "Failed to load branch data",
        variant: "destructive",
      });
    }
  }, [branchQuery, toast]);

  useEffect(() => {
    if (!branchQuery.isError) {
      return;
    }
    logDevError("Failed to fetch branch hub config");
    toast({
      title: "Error",
      description: "Failed to load branch data",
      variant: "destructive",
    });
  }, [branchQuery.isError, toast]);

  return {
    loading,
    branch,
    fetchBranch,
  };
}
