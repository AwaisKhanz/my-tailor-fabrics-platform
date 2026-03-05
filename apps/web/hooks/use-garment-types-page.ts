"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type GarmentType, type WorkflowStepTemplate } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

export type GarmentTypeWithWorkflow = GarmentType & {
  workflowSteps?: WorkflowStepTemplate[];
};

export interface GarmentTypesStats {
  totalCount: number;
  avgRetailPrice: number;
  activeProduction: number;
}

const EMPTY_GARMENT_STATS: GarmentTypesStats = {
  totalCount: 0,
  avgRetailPrice: 0,
  activeProduction: 0,
};

export function useGarmentTypesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [garmentTypes, setGarmentTypes] = useState<GarmentTypeWithWorkflow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<GarmentTypesStats>(EMPTY_GARMENT_STATS);

  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const currentPage = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const [selectedType, setSelectedType] = useState<GarmentTypeWithWorkflow | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<GarmentTypeWithWorkflow | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchGarmentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const [listResponse, statsResponse] = await Promise.all([
        configApi.getGarmentTypes({
          search: debouncedSearch.trim() || undefined,
          page: currentPage,
          limit: pageSize,
        }),
        configApi.getGarmentStats(),
      ]);

      if (listResponse.success) {
        setGarmentTypes(listResponse.data.data);
        setTotalCount(listResponse.data.total);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      logDevError("Failed to fetch garment types:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize]);

  useEffect(() => {
    void fetchGarmentTypes();
  }, [fetchGarmentTypes]);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const setSearchFilter = useCallback((value: string) => {
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

  const openCreateDialog = useCallback(() => {
    setSelectedType(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((garmentType: GarmentTypeWithWorkflow) => {
    setSelectedType(garmentType);
    setIsDialogOpen(true);
  }, []);

  const openHistoryDialog = useCallback((garmentType: GarmentTypeWithWorkflow) => {
    setSelectedType(garmentType);
    setIsHistoryOpen(true);
  }, []);

  const openWorkflowDialog = useCallback((garmentType: GarmentTypeWithWorkflow) => {
    setSelectedType(garmentType);
    setIsWorkflowOpen(true);
  }, []);

  const requestDelete = useCallback((garmentType: GarmentTypeWithWorkflow) => {
    setTypeToDelete(garmentType);
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!typeToDelete) {
      return;
    }

    try {
      await configApi.deleteGarmentType(typeToDelete.id);
      toast({
        title: "Success",
        description: "Garment type deleted",
      });
      setTypeToDelete(null);
      setIsConfirmOpen(false);
      await fetchGarmentTypes();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete garment type",
        variant: "destructive",
      });
    }
  }, [fetchGarmentTypes, toast, typeToDelete]);

  const closeGarmentDialog = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedType(null);
    }
  }, []);

  const closeHistoryDialog = useCallback((open: boolean) => {
    setIsHistoryOpen(open);
    if (!open) {
      setSelectedType((previous) => (isWorkflowOpen ? previous : null));
    }
  }, [isWorkflowOpen]);

  const closeWorkflowDialog = useCallback((open: boolean) => {
    setIsWorkflowOpen(open);
    if (!open) {
      setSelectedType((previous) => (isHistoryOpen ? previous : null));
    }
  }, [isHistoryOpen]);

  const closeConfirmDialog = useCallback((open: boolean) => {
    setIsConfirmOpen(open);
    if (!open) {
      setTypeToDelete(null);
    }
  }, []);

  return {
    loading,
    garmentTypes,
    totalCount,
    stats,
    search,
    currentPage,
    pageSize,
    hasActiveFilters,
    selectedType,
    typeToDelete,
    isDialogOpen,
    isHistoryOpen,
    isWorkflowOpen,
    isConfirmOpen,
    setCurrentPage,
    setSearchFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    openHistoryDialog,
    openWorkflowDialog,
    requestDelete,
    closeGarmentDialog,
    closeHistoryDialog,
    closeWorkflowDialog,
    closeConfirmDialog,
    fetchGarmentTypes,
    confirmDelete,
  };
}
