"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type GarmentType } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

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
      includeArchived: "false",
    },
  });

  const [loading, setLoading] = useState(true);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<GarmentTypesStats>(EMPTY_GARMENT_STATS);

  const search = values.search;
  const includeArchived = values.includeArchived === "true";
  const debouncedSearch = useDebounce(search, 500);
  const currentPage = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<GarmentType | null>(null);

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
          includeArchived,
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
  }, [currentPage, debouncedSearch, includeArchived, pageSize]);

  useEffect(() => {
    void fetchGarmentTypes();
  }, [fetchGarmentTypes]);

  const hasActiveFilters = useMemo(
    () => search.trim().length > 0 || includeArchived,
    [includeArchived, search],
  );
  const activeFilterCount = useMemo(
    () => (search.trim().length > 0 ? 1 : 0) + (includeArchived ? 1 : 0),
    [includeArchived, search],
  );

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setIncludeArchived = useCallback(
    (next: boolean) => {
      setValues({
        includeArchived: next ? "true" : "false",
        page: "1",
      });
    },
    [setValues],
  );

  const setCurrentPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const openCreateDialog = useCallback(() => {
    setSelectedType(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((garmentType: GarmentType) => {
    setSelectedType(garmentType);
    setIsDialogOpen(true);
  }, []);

  const openHistoryDialog = useCallback((garmentType: GarmentType) => {
    setSelectedType(garmentType);
    setIsHistoryOpen(true);
  }, []);

  const openWorkflowDialog = useCallback((garmentType: GarmentType) => {
    setSelectedType(garmentType);
    setIsWorkflowOpen(true);
  }, []);

  const requestDelete = useCallback((garmentType: GarmentType) => {
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
        description: "Garment type archived",
      });
      setTypeToDelete(null);
      setIsConfirmOpen(false);
      await fetchGarmentTypes();
    } catch {
      toast({
        title: "Error",
        description: "Failed to archive garment type",
        variant: "destructive",
      });
    }
  }, [fetchGarmentTypes, toast, typeToDelete]);

  const restoreType = useCallback(
    async (garmentType: GarmentType) => {
      if (!garmentType.deletedAt) {
        return;
      }

      setRestoringId(garmentType.id);
      try {
        await configApi.restoreGarmentType(garmentType.id);
        toast({
          title: "Success",
          description: "Garment type restored",
        });
        await fetchGarmentTypes();
      } catch {
        toast({
          title: "Error",
          description: "Failed to restore garment type",
          variant: "destructive",
        });
      } finally {
        setRestoringId(null);
      }
    },
    [fetchGarmentTypes, toast],
  );

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
    activeFilterCount,
    includeArchived,
    restoringId,
    selectedType,
    typeToDelete,
    isDialogOpen,
    isHistoryOpen,
    isWorkflowOpen,
    isConfirmOpen,
    setCurrentPage,
    setSearchFilter,
    setIncludeArchived,
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
    restoreType,
  };
}
