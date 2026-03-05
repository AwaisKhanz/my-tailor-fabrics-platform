"use client";

import { useCallback, useEffect, useState } from "react";
import { type MeasurementCategory, type MeasurementField } from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";

function getErrorStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return null;
  }

  const response = error.response;
  if (!response || typeof response !== "object" || !("status" in response)) {
    return null;
  }

  return typeof response.status === "number" ? response.status : null;
}

export function useMeasurementCategoryDetailPage(id: string) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MeasurementCategory | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(null);
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<MeasurementField | null>(null);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategory(id);
      if (response.success) {
        setCategory(response.data);
        setNotFound(false);
      }
    } catch (error) {
      logDevError("Failed to fetch category details:", error);
      const statusCode = getErrorStatusCode(error) ?? 0;
      if (statusCode === 404) {
        setCategory(null);
        setNotFound(true);
      } else {
        setNotFound(false);
        toast({
          title: "Error",
          description: "Failed to load category details",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void fetchCategory();
  }, [fetchCategory]);

  const openAddFieldDialog = useCallback(() => {
    setSelectedField(null);
    setIsFieldDialogOpen(true);
  }, []);

  const openAddSectionDialog = useCallback(() => {
    setIsSectionDialogOpen(true);
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

  const closeSectionDialog = useCallback((open: boolean) => {
    setIsSectionDialogOpen(open);
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
    notFound,
    isFieldDialogOpen,
    selectedField,
    isSectionDialogOpen,
    isConfirmOpen,
    fieldToDelete,
    openAddSectionDialog,
    openAddFieldDialog,
    openEditFieldDialog,
    closeSectionDialog,
    closeFieldDialog,
    requestDeleteField,
    closeDeleteConfirm,
    confirmDeleteField,
    fetchCategory,
  };
}
