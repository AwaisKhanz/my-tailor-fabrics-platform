"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MeasurementCategory,
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { configApi } from "@/lib/api/config";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import {
  getApiErrorMessageOrFallback,
  getApiErrorStatus,
} from "@/lib/utils/error";

export function useMeasurementCategoryDetailPage(id: string) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<MeasurementCategory | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(null);
  const [preferredSectionId, setPreferredSectionId] = useState<string | null>(
    null,
  );
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<MeasurementSection | null>(
    null,
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<MeasurementField | null>(null);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await configApi.getMeasurementCategory(id, {
        includeArchived,
      });
      if (response.success) {
        setCategory(response.data);
        setNotFound(false);
      }
    } catch (error) {
      logDevError("Failed to fetch category details:", error);
      const statusCode = getApiErrorStatus(error) ?? 0;
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
  }, [id, includeArchived, toast]);

  useEffect(() => {
    void fetchCategory();
  }, [fetchCategory]);

  const openAddFieldDialog = useCallback((sectionId?: string) => {
    setSelectedField(null);
    setPreferredSectionId(sectionId ?? null);
    setIsFieldDialogOpen(true);
  }, []);

  const openAddSectionDialog = useCallback(() => {
    setSelectedSection(null);
    setIsSectionDialogOpen(true);
  }, []);

  const openEditSectionDialog = useCallback((section: MeasurementSection) => {
    setSelectedSection(section);
    setIsSectionDialogOpen(true);
  }, []);

  const openEditFieldDialog = useCallback((field: MeasurementField) => {
    setSelectedField(field);
    setPreferredSectionId(field.sectionId ?? null);
    setIsFieldDialogOpen(true);
  }, []);

  const closeFieldDialog = useCallback((open: boolean) => {
    setIsFieldDialogOpen(open);
    if (!open) {
      setSelectedField(null);
      setPreferredSectionId(null);
    }
  }, []);

  const closeSectionDialog = useCallback((open: boolean) => {
    setIsSectionDialogOpen(open);
    if (!open) {
      setSelectedSection(null);
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
      toast({ title: "Field archived" });
      setFieldToDelete(null);
      setIsConfirmOpen(false);
      await fetchCategory();
    } catch {
      toast({
        title: "Error",
        description: "Failed to archive field",
        variant: "destructive",
      });
    }
  }, [fetchCategory, fieldToDelete, toast]);

  const moveFieldToSection = useCallback(
    async (field: MeasurementField, targetSectionId: string) => {
      try {
        await configApi.updateMeasurementField(field.id, {
          sectionId: targetSectionId,
        });
        toast({
          title: "Field moved",
          description: `"${field.label}" moved to the selected section.`,
        });
        await fetchCategory();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to move field to the selected section.",
          ),
          variant: "destructive",
        });
        throw error;
      }
    },
    [fetchCategory, toast],
  );

  const deleteSection = useCallback(
    async (sectionId: string, targetSectionId?: string) => {
      try {
        const response = await configApi.deleteMeasurementSection(sectionId, {
          targetSectionId,
        });

        const movedCount = response.data.movedFieldCount;
        toast({
          title: "Section archived",
          description:
            movedCount > 0
              ? `${movedCount} field${movedCount === 1 ? "" : "s"} moved successfully.`
              : "Section archived successfully.",
        });

        await fetchCategory();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to archive section. Please try again.",
          ),
          variant: "destructive",
        });
        throw error;
      }
    },
    [fetchCategory, toast],
  );

  const restoreField = useCallback(
    async (fieldId: string) => {
      try {
        await configApi.restoreMeasurementField(fieldId);
        toast({ title: "Field restored" });
        await fetchCategory();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to restore field",
          ),
          variant: "destructive",
        });
      }
    },
    [fetchCategory, toast],
  );

  const restoreSection = useCallback(
    async (sectionId: string) => {
      try {
        await configApi.restoreMeasurementSection(sectionId);
        toast({ title: "Section restored" });
        await fetchCategory();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to restore section",
          ),
          variant: "destructive",
        });
      }
    },
    [fetchCategory, toast],
  );

  return {
    loading,
    category,
    notFound,
    includeArchived,
    setIncludeArchived,
    isFieldDialogOpen,
    selectedField,
    preferredSectionId,
    isSectionDialogOpen,
    selectedSection,
    isConfirmOpen,
    fieldToDelete,
    openAddSectionDialog,
    openEditSectionDialog,
    openAddFieldDialog,
    openEditFieldDialog,
    closeSectionDialog,
    closeFieldDialog,
    requestDeleteField,
    closeDeleteConfirm,
    confirmDeleteField,
    moveFieldToSection,
    deleteSection,
    restoreField,
    restoreSection,
    fetchCategory,
  };
}
