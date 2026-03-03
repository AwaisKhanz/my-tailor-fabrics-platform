"use client";

import { useCallback, useEffect, useState } from "react";
import { type BranchDetail } from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";

export function useBranchHubConfigPage(branchId: string) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<BranchDetail | null>(null);

  const fetchBranch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchesApi.getBranch(branchId);
      if (response.success) {
        setBranch(response.data);
      }
    } catch (error) {
      logDevError("Failed to fetch branch hub config:", error);
      toast({
        title: "Error",
        description: "Failed to load branch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void fetchBranch();
  }, [fetchBranch]);

  return {
    loading,
    branch,
    fetchBranch,
  };
}
