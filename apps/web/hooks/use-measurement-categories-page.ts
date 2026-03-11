"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type MeasurementCategory,
  type MeasurementStats,
} from "@tbms/shared-types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useDeleteMeasurementCategory,
  useMeasurementCategories,
  useMeasurementStats,
  useRestoreMeasurementCategory,
} from "@/hooks/queries/config-queries";

const PAGE_SIZE = 10;
const EMPTY_MEASUREMENT_STATS: MeasurementStats = {
  totalCategories: 0,
  activeCategories: 0,
  totalFields: 0,
  requiredFields: 0,
};

export function useMeasurementCategoriesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      includeArchived: "false",
    },
  });

  const search = values.search;
  const includeArchived = values.includeArchived === "true";
  const debouncedSearch = useDebounce(search, 500);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const [restoringId, setRestoringId] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MeasurementCategory | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<MeasurementCategory | null>(null);

  const categoriesQuery = useMeasurementCategories({
    search: debouncedSearch.trim() || undefined,
    page,
    limit: pageSize,
    includeArchived,
  });
  const statsQuery = useMeasurementStats();
  const deleteCategoryMutation = useDeleteMeasurementCategory();
  const restoreCategoryMutation = useRestoreMeasurementCategory();

  const loading = categoriesQuery.isLoading || statsQuery.isLoading;
  const categories: MeasurementCategory[] = categoriesQuery.data?.success
    ? categoriesQuery.data.data.data
    : [];
  const total = categoriesQuery.data?.success
    ? categoriesQuery.data.data.total
    : 0;
  const stats: MeasurementStats = statsQuery.data?.success
    ? statsQuery.data.data
    : EMPTY_MEASUREMENT_STATS;

  const fetchCategories = useCallback(async () => {
    try {
      await Promise.all([categoriesQuery.refetch(), statsQuery.refetch()]);
    } catch (error) {
      logDevError("Failed to fetch measurement categories:", error);
    }
  }, [categoriesQuery, statsQuery]);

  const hasActiveFilters = useMemo(
    () => search.trim().length > 0 || includeArchived,
    [includeArchived, search],
  );
  const activeFilterCount = useMemo(
    () => (search.trim().length > 0 ? 1 : 0) + (includeArchived ? 1 : 0),
    [includeArchived, search],
  );

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

  const setIncludeArchived = useCallback(
    (next: boolean) => {
      setValues({
        includeArchived: next ? "true" : "false",
        page: "1",
      });
    },
    [setValues],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const openCreateDialog = useCallback(() => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((category: MeasurementCategory) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  }, []);

  const requestDelete = useCallback((category: MeasurementCategory) => {
    setCategoryToDelete(category);
    setIsConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback((open: boolean) => {
    setIsConfirmOpen(open);
    if (!open) {
      setCategoryToDelete(null);
    }
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryToDelete.id });
      toast({ title: "Category archived" });
      setCategoryToDelete(null);
      setIsConfirmOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to archive category",
        variant: "destructive",
      });
    }
  }, [categoryToDelete, deleteCategoryMutation, toast]);

  const restoreCategory = useCallback(
    async (category: MeasurementCategory) => {
      if (!category.deletedAt) {
        return;
      }

      setRestoringId(category.id);
      try {
        await restoreCategoryMutation.mutateAsync(category.id);
        toast({ title: "Category restored" });
      } catch {
        toast({
          title: "Error",
          description: "Failed to restore category",
          variant: "destructive",
        });
      } finally {
        setRestoringId(null);
      }
    },
    [restoreCategoryMutation, toast],
  );

  return {
    loading,
    categories,
    total,
    stats,
    search,
    includeArchived,
    activeFilterCount,
    restoringId,
    page,
    pageSize,
    hasActiveFilters,
    isDialogOpen,
    selectedCategory,
    isConfirmOpen,
    categoryToDelete,
    setPage,
    setSearchFilter,
    setIncludeArchived,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    requestDelete,
    closeConfirm,
    confirmDelete,
    restoreCategory,
    fetchCategories,
  };
}
