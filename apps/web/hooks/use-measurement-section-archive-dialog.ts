"use client";

import { useCallback, useMemo, useState } from "react";
import {
  type MeasurementCategory,
  type MeasurementSection,
} from "@tbms/shared-types";

interface UseMeasurementSectionArchiveDialogParams {
  category: MeasurementCategory | null;
  deleteSection: (sectionId: string, targetSectionId?: string) => Promise<void>;
}

export function useMeasurementSectionArchiveDialog({
  category,
  deleteSection,
}: UseMeasurementSectionArchiveDialogParams) {
  const [isSectionDeleteOpen, setIsSectionDeleteOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] =
    useState<MeasurementSection | null>(null);
  const [targetSectionId, setTargetSectionId] = useState("");
  const [isDeletingSection, setIsDeletingSection] = useState(false);

  const sectionFieldCounts = useMemo(() => {
    const counts = new Map<string, number>();

    (category?.fields ?? []).forEach((field) => {
      if (!field.sectionId) {
        return;
      }

      counts.set(field.sectionId, (counts.get(field.sectionId) ?? 0) + 1);
    });

    return counts;
  }, [category?.fields]);

  const deleteSectionTargetOptions = useMemo(
    () =>
      (category?.sections ?? [])
        .filter((section) => section.id !== sectionToDelete?.id)
        .sort((left, right) => {
          if (left.sortOrder !== right.sortOrder) {
            return left.sortOrder - right.sortOrder;
          }

          return left.name.localeCompare(right.name);
        }),
    [category?.sections, sectionToDelete?.id],
  );

  const fieldsInDeletingSection = sectionToDelete
    ? (sectionFieldCounts.get(sectionToDelete.id) ?? 0)
    : 0;
  const requiresMoveTarget = fieldsInDeletingSection > 0;
  const cannotDeleteSection =
    requiresMoveTarget && deleteSectionTargetOptions.length === 0;

  const openDeleteSectionDialog = useCallback(
    (section: MeasurementSection) => {
      setSectionToDelete(section);
      const fallbackTargetId =
        (category?.sections ?? []).find((item) => item.id !== section.id)?.id ??
        "";
      setTargetSectionId(fallbackTargetId);
      setIsSectionDeleteOpen(true);
    },
    [category?.sections],
  );

  const closeDeleteSectionDialog = useCallback((open: boolean) => {
    setIsSectionDeleteOpen(open);
    if (!open) {
      setSectionToDelete(null);
      setTargetSectionId("");
      setIsDeletingSection(false);
    }
  }, []);

  const confirmDeleteSection = useCallback(async () => {
    if (!sectionToDelete || cannotDeleteSection) {
      return;
    }

    if (requiresMoveTarget && !targetSectionId) {
      return;
    }

    setIsDeletingSection(true);
    try {
      await deleteSection(
        sectionToDelete.id,
        requiresMoveTarget ? targetSectionId : undefined,
      );
      closeDeleteSectionDialog(false);
    } finally {
      setIsDeletingSection(false);
    }
  }, [
    cannotDeleteSection,
    closeDeleteSectionDialog,
    deleteSection,
    requiresMoveTarget,
    sectionToDelete,
    targetSectionId,
  ]);

  return {
    isSectionDeleteOpen,
    sectionToDelete,
    targetSectionId,
    isDeletingSection,
    deleteSectionTargetOptions,
    fieldsInDeletingSection,
    requiresMoveTarget,
    cannotDeleteSection,
    setTargetSectionId,
    openDeleteSectionDialog,
    closeDeleteSectionDialog,
    confirmDeleteSection,
  };
}
