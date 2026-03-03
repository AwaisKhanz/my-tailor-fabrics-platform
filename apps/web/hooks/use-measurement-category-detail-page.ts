"use client";

import { useCallback, useEffect, useState } from "react";
import { type MeasurementCategory, type MeasurementField } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";

export function useMeasurementCategoryDetailPage(id: string) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MeasurementCategory | null>(null);

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<MeasurementField | null>(null);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategories({ limit: 100 });
      if (response.success) {
        const currentCategory = response.data.data.find((entry) => entry.id === id) ?? null;
        setCategory(currentCategory);
      }
    } catch (error) {
      logDevError("Failed to fetch category details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchCategory();
  }, [fetchCategory]);

  const openAddFieldDialog = useCallback(() => {
    setSelectedField(null);
    setIsFieldDialogOpen(true);
  }, []);

  const openEditFieldDialog = useCallback((field: MeasurementField) => {
    setSelectedField(field);
    setIsFieldDialogOpen(true);
  }, []);

  const closeFieldDialog = useCallback((open: boolean) => {
    setIsFieldDialogOpen(open);
    if (!open) {
      setSelectedField(null);
    }
  }, []);

  const requestDeleteField = useCallback((field: MeasurementField) => {
    setFieldToDelete(field);
    setIsConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback((open: boolean) => {
    setIsConfirmOpen(open);
    if (!open) {
      setFieldToDelete(null);
    }
  }, []);

  const confirmDeleteField = useCallback(async () => {
    if (!fieldToDelete) {
      return;
    }

    try {
      await configApi.deleteMeasurementField(fieldToDelete.id);
      toast({ title: "Field deleted" });
      setFieldToDelete(null);
      setIsConfirmOpen(false);
      await fetchCategory();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  }, [fetchCategory, fieldToDelete, toast]);

  return {
    loading,
    category,
    isFieldDialogOpen,
    selectedField,
    isConfirmOpen,
    fieldToDelete,
    openAddFieldDialog,
    openEditFieldDialog,
    closeFieldDialog,
    requestDeleteField,
    closeDeleteConfirm,
    confirmDeleteField,
    fetchCategory,
  };
}
