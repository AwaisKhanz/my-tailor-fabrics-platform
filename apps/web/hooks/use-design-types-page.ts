"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Branch,
  type DesignType,
  type GarmentType,
} from "@tbms/shared-types";
import { type DesignTypeSubmitPayload } from "@/hooks/use-design-type-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useCreateDesignType,
  useDeleteDesignType,
  useDesignTypesList,
  useUpdateDesignType,
} from "@/hooks/queries/design-type-queries";
import { useGarmentTypesList } from "@/hooks/queries/config-queries";
import { useBranchesList } from "@/hooks/queries/branch-queries";

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

  const search = values.search;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const debouncedSearch = useDebounce(search, 350);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<DesignType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const designTypesQuery = useDesignTypesList({
    search: debouncedSearch.trim() || undefined,
  });
  const garmentTypesQuery = useGarmentTypesList({ limit: 100 });
  const branchesQuery = useBranchesList({ page: 1, limit: 100 });
  const createDesignTypeMutation = useCreateDesignType();
  const updateDesignTypeMutation = useUpdateDesignType();
  const deleteDesignTypeMutation = useDeleteDesignType();

  const loading =
    designTypesQuery.isLoading ||
    garmentTypesQuery.isLoading ||
    branchesQuery.isLoading;
  const designTypes: DesignType[] = designTypesQuery.data?.success
    ? designTypesQuery.data.data
    : [];
  const garmentTypes: GarmentType[] = garmentTypesQuery.data?.success
    ? garmentTypesQuery.data.data.data
    : [];
  const branches: Branch[] = branchesQuery.data?.success
    ? branchesQuery.data.data.data
    : [];

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        designTypesQuery.refetch(),
        garmentTypesQuery.refetch(),
        branchesQuery.refetch(),
      ]);
    } catch (error) {
      logDevError("Failed to fetch design types data:", error);
      toast({
        title: "Error",
        description: "Failed to load design types",
        variant: "destructive",
      });
    }
  }, [branchesQuery, designTypesQuery, garmentTypesQuery, toast]);

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

  const setSearchFilter = useCallback(
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

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const saveDesignType = useCallback(
    async (payload: DesignTypeSubmitPayload) => {
      try {
        if (payload.mode === "update" && selectedDesign) {
          await updateDesignTypeMutation.mutateAsync({
            id: selectedDesign.id,
            data: payload.data,
          });
          toast({
            title: "Updated",
            description: "Design type updated successfully",
          });
        } else if (payload.mode === "create") {
          await createDesignTypeMutation.mutateAsync(payload.data);
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
    [
      createDesignTypeMutation,
      fetchData,
      selectedDesign,
      toast,
      updateDesignTypeMutation,
    ],
  );

  const requestDeleteDesignType = useCallback((designType: DesignType) => {
    setDeleteTarget(designType);
  }, []);

  const closeDeleteDialog = useCallback(
    (open: boolean) => {
      if (!deleting) {
        if (!open) {
          setDeleteTarget(null);
        }
      }
    },
    [deleting],
  );

  const confirmDeleteDesignType = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDesignTypeMutation.mutateAsync(deleteTarget.id);
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
  }, [deleteDesignTypeMutation, deleteTarget, fetchData, toast]);

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
