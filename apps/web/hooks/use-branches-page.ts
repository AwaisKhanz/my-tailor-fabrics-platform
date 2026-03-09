"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Branch } from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useBranchDialogManager } from "@/hooks/use-branch-dialog-manager";

const ITEMS_PER_PAGE = 10;

export function useBranchesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(ITEMS_PER_PAGE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const currentPage = getPositiveInt("page", 1);
  const itemsPerPage = getPositiveInt("limit", ITEMS_PER_PAGE);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchesApi.getBranches({
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      setBranches(response.data.data);
      setTotalCount(response.data.total);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage, toast]);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const updateSearch = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setCurrentPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const {
    dialogOpen,
    editingBranch,
    saving,
    form,
    formError,
    fieldErrors,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveBranch,
  } = useBranchDialogManager({
    fetchBranches,
    toast,
  });

  const requestDelete = useCallback((branch: Branch) => {
    setBranchToDelete(branch);
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!branchToDelete) {
      return;
    }

    try {
      await branchesApi.removeBranch(branchToDelete.id);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
      setBranchToDelete(null);
      setIsConfirmOpen(false);
      await fetchBranches();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error) ?? "Failed to delete branch",
        variant: "destructive",
      });
    }
  }, [branchToDelete, fetchBranches, toast]);

  const toggleBranchActive = useCallback(
    async (branch: Branch) => {
      try {
        await branchesApi.updateBranch(branch.id, { isActive: !branch.isActive });
        await fetchBranches();
      } catch {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    },
    [fetchBranches, toast],
  );

  return {
    loading,
    saving,
    branches,
    totalCount,
    search,
    currentPage,
    itemsPerPage,
    hasActiveFilters,
    dialogOpen,
    editingBranch,
    form,
    formError,
    fieldErrors,
    isConfirmOpen,
    branchToDelete,
    setCurrentPage,
    setIsConfirmOpen,
    updateSearch,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveBranch,
    requestDelete,
    confirmDelete,
    toggleBranchActive,
  };
}
