"use client";

import { useCallback, useEffect, useState } from "react";
import { type Branch, type DesignType, type GarmentType } from "@tbms/shared-types";
import { designTypesApi } from "@/lib/api/design-types";
import { configApi } from "@/lib/api/config";
import { branchesApi } from "@/lib/api/branches";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { logDevError } from "@/lib/logger";

export function useDesignTypesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [designTypes, setDesignTypes] = useState<DesignType[]>([]);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
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
    setSearch(value);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
  }, []);

  const saveDesignType = useCallback(
    async (data: Partial<DesignType>) => {
      try {
        if (selectedDesign) {
          await designTypesApi.update(selectedDesign.id, data);
          toast({
            title: "Updated",
            description: "Design type updated successfully",
          });
        } else {
          await designTypesApi.create(data);
          toast({
            title: "Created",
            description: "Design type created successfully",
          });
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
    garmentTypes,
    branches,
    search,
    hasActiveFilters: Boolean(search.trim()),
    createDialogOpen,
    selectedDesign,
    deleteTarget,
    deleting,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    setSearchFilter,
    resetFilters,
    saveDesignType,
    requestDeleteDesignType,
    closeDeleteDialog,
    confirmDeleteDesignType,
  };
}
