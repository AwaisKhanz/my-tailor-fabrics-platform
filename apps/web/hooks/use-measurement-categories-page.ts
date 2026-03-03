"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type MeasurementCategory } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";

const PAGE_SIZE = 10;

export function useMeasurementCategoriesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<MeasurementCategory[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MeasurementCategory | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MeasurementCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategories({
        search: debouncedSearch.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      });

      if (response.success) {
        setCategories(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      logDevError("Failed to fetch measurement categories:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

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
      await configApi.deleteMeasurementCategory(categoryToDelete.id);
      toast({ title: "Category deleted" });
      setCategoryToDelete(null);
      setIsConfirmOpen(false);
      await fetchCategories();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  }, [categoryToDelete, fetchCategories, toast]);

  return {
    loading,
    categories,
    total,
    search,
    page,
    pageSize: PAGE_SIZE,
    hasActiveFilters,
    isDialogOpen,
    selectedCategory,
    isConfirmOpen,
    categoryToDelete,
    setPage,
    setSearchFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    requestDelete,
    closeConfirm,
    confirmDelete,
    fetchCategories,
  };
}
