"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type MeasurementCategory,
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { logDevError } from "@/lib/logger";
import {
  getApiErrorMessageOrFallback,
  getApiErrorStatus,
} from "@/lib/utils/error";
import {
  useDeleteMeasurementField,
  useDeleteMeasurementSection,
  useMeasurementCategory,
  useRestoreMeasurementField,
  useRestoreMeasurementSection,
  useUpdateMeasurementField,
} from "@/hooks/queries/config-queries";

export function useMeasurementCategoryDetailPage(id: string) {
  const { toast } = useToast();

  const [includeArchived, setIncludeArchived] = useState(false);
  const categoryQuery = useMeasurementCategory(id, { includeArchived });
  const updateFieldMutation = useUpdateMeasurementField();
  const deleteFieldMutation = useDeleteMeasurementField();
  const deleteSectionMutation = useDeleteMeasurementSection();
  const restoreFieldMutation = useRestoreMeasurementField();
  const restoreSectionMutation = useRestoreMeasurementSection();

  const loading = categoryQuery.isLoading;
  const category: MeasurementCategory | null = categoryQuery.data?.success
    ? categoryQuery.data.data
    : null;
  const queryStatusCode = getApiErrorStatus(categoryQuery.error) ?? 0;
  const notFound = categoryQuery.isError && queryStatusCode === 404;

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<MeasurementField | null>(
    null,
  );
  const [preferredSectionId, setPreferredSectionId] = useState<string | null>(
    null,
  );
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<MeasurementSection | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<MeasurementField | null>(
    null,
  );

  const fetchCategory = useCallback(async () => {
    try {
      await categoryQuery.refetch();
    } catch (error) {
      logDevError("Failed to fetch category details:", error);
      toast({
        title: "Error",
        description: "Failed to load category details",
        variant: "destructive",
      });
    }
  }, [categoryQuery, toast]);

  useEffect(() => {
    if (!categoryQuery.isError || notFound) {
      return;
    }
    logDevError("Failed to fetch category details:", categoryQuery.error);
    toast({
      title: "Error",
      description: "Failed to load category details",
      variant: "destructive",
    });
  }, [categoryQuery.error, categoryQuery.isError, notFound, toast]);

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
    if (!category) {
      return;
    }

    try {
      await deleteFieldMutation.mutateAsync({
        fieldId: fieldToDelete.id,
        categoryId: category.id,
      });
      toast({ title: "Field archived" });
      setFieldToDelete(null);
      setIsConfirmOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to archive field",
        variant: "destructive",
      });
    }
  }, [category, deleteFieldMutation, fieldToDelete, toast]);

  const moveFieldToSection = useCallback(
    async (field: MeasurementField, targetSectionId: string) => {
      if (!category) {
        return;
      }
      try {
        await updateFieldMutation.mutateAsync({
          fieldId: field.id,
          data: {
            sectionId: targetSectionId,
          },
          categoryId: category.id,
        });
        toast({
          title: "Field moved",
          description: `"${field.label}" moved to the selected section.`,
        });
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
    [category, toast, updateFieldMutation],
  );

  const deleteSection = useCallback(
    async (sectionId: string, targetSectionId?: string) => {
      if (!category) {
        return;
      }
      try {
        const response = await deleteSectionMutation.mutateAsync({
          sectionId,
          data: {
            targetSectionId,
          },
          categoryId: category.id,
        });

        const movedCount = response.data.movedFieldCount;
        toast({
          title: "Section archived",
          description:
            movedCount > 0
              ? `${movedCount} field${movedCount === 1 ? "" : "s"} moved successfully.`
              : "Section archived successfully.",
        });
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
    [category, deleteSectionMutation, toast],
  );

  const restoreField = useCallback(
    async (fieldId: string) => {
      if (!category) {
        return;
      }
      try {
        await restoreFieldMutation.mutateAsync({
          fieldId,
          categoryId: category.id,
        });
        toast({ title: "Field restored" });
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
    [category, restoreFieldMutation, toast],
  );

  const restoreSection = useCallback(
    async (sectionId: string) => {
      if (!category) {
        return;
      }
      try {
        await restoreSectionMutation.mutateAsync({
          sectionId,
          categoryId: category.id,
        });
        toast({ title: "Section restored" });
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
    [category, restoreSectionMutation, toast],
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
