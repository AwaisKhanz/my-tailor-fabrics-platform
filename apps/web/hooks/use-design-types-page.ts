"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Branch,
  type DesignType,
  type GarmentType,
} from "@tbms/shared-types";
import { designTypesApi } from "@/lib/api/design-types";
import { configApi } from "@/lib/api/config";
import { branchesApi } from "@/lib/api/branches";
import { type DesignTypeSubmitPayload } from "@/hooks/use-design-type-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

export function useDesignTypesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [designTypes, setDesignTypes] = useState<DesignType[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const search = values.search;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const debouncedSearch = useDebounce(search, 350);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DesignType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [designTypesResponse, garmentsResponse, branchesResponse] = await Promise.all([
        designTypesApi.findAll({ search: debouncedSearch.trim() || undefined }),
        configApi.getGarmentTypes({ limit: 100 }),
        branchesApi.getBranches({ page: 1, limit: 100 }),
      ]);

      if (designTypesResponse.success) {
        setDesignTypes(designTypesResponse.data);
      }

      if (garmentsResponse.success && garmentsResponse.data) {
        setGarmentTypes(garmentsResponse.data.data);
      }

      if (branchesResponse.success && branchesResponse.data) {
        setBranches(branchesResponse.data.data);
      }
    } catch (error) {
      logDevError("Failed to fetch design types data:", error);
      toast({
        title: "Error",
        description: "Failed to load design types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const totalCount = designTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setValues({ page: String(totalPages) });
    }
  }, [page, setValues, totalPages]);

  const pagedDesignTypes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return designTypes.slice(start, start + pageSize);
  }, [designTypes, page, pageSize]);

  const openCreateDialog = useCallback(() => {
    setSelectedDesign(null);
    setCreateDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((designType: DesignType) => {
    setSelectedDesign(designType);
    setCreateDialogOpen(true);
  }, []);

  const closeCreateDialog = useCallback((open: boolean) => {
    setCreateDialogOpen(open);
  }, []);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const saveDesignType = useCallback(
    async (payload: DesignTypeSubmitPayload) => {
      try {
        if (payload.mode === "update" && selectedDesign) {
          await designTypesApi.update(selectedDesign.id, payload.data);
          toast({
            title: "Updated",
            description: "Design type updated successfully",
          });
        } else if (payload.mode === "create") {
          await designTypesApi.create(payload.data);
          toast({
            title: "Created",
            description: "Design type created successfully",
          });
        } else {
          return;
        }

        await fetchData();
      } catch {
        toast({
          title: "Error",
          description: "Save failed",
          variant: "destructive",
        });
      }
    },
    [fetchData, selectedDesign, toast],
  );

  const requestDeleteDesignType = useCallback((designType: DesignType) => {
    setDeleteTarget(designType);
  }, []);

  const closeDeleteDialog = useCallback((open: boolean) => {
    if (!deleting) {
      if (!open) {
        setDeleteTarget(null);
      }
    }
  }, [deleting]);

  const confirmDeleteDesignType = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await designTypesApi.remove(deleteTarget.id);
      toast({
        title: "Removed",
        description: "Design type removed",
      });
      setDeleteTarget(null);
      await fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Remove failed",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchData, toast]);

  return {
    loading,
    designTypes,
    pagedDesignTypes,
    totalCount,
    garmentTypes,
    branches,
    search,
    page,
    pageSize,
    hasActiveFilters: Boolean(search.trim()),
    createDialogOpen,
    selectedDesign,
    deleteTarget,
    deleting,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    setPage,
    setSearchFilter,
    resetFilters,
    saveDesignType,
    requestDeleteDesignType,
    closeDeleteDialog,
    confirmDeleteDesignType,
  };
}
