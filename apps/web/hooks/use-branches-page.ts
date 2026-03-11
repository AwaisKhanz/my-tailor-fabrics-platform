"use client";

import { useCallback, useMemo, useState } from "react";
import { type Branch } from "@tbms/shared-types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useBranchDialogManager } from "@/hooks/use-branch-dialog-manager";
import {
  useBranchesList,
  useRemoveBranch,
  useUpdateBranch,
} from "@/hooks/queries/branch-queries";

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

  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const currentPage = getPositiveInt("page", 1);
  const itemsPerPage = getPositiveInt("limit", ITEMS_PER_PAGE);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const branchesQuery = useBranchesList({
    search: debouncedSearch.trim() || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });
  const removeBranchMutation = useRemoveBranch();
  const updateBranchMutation = useUpdateBranch();

  const loading = branchesQuery.isLoading;
  const branches: Branch[] = branchesQuery.data?.success
    ? branchesQuery.data.data.data
    : [];
  const totalCount = branchesQuery.data?.success
    ? branchesQuery.data.data.total
    : 0;

  const fetchBranches = useCallback(async () => {
    try {
      await branchesQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    }
  }, [branchesQuery, toast]);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const updateSearch = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setCurrentPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

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
      await removeBranchMutation.mutateAsync(branchToDelete.id);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
      setBranchToDelete(null);
      setIsConfirmOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error) ?? "Failed to delete branch",
        variant: "destructive",
      });
    }
  }, [branchToDelete, removeBranchMutation, toast]);

  const toggleBranchActive = useCallback(
    async (branch: Branch) => {
      try {
        await updateBranchMutation.mutateAsync({
          id: branch.id,
          data: { isActive: !branch.isActive },
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    },
    [toast, updateBranchMutation],
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
