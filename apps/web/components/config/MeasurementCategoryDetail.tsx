"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type MeasurementSection } from "@tbms/shared-types";
import { MeasurementFieldDialog } from "@/components/config/MeasurementFieldDialog";
import { MeasurementSectionDialog } from "@/components/config/MeasurementSectionDialog";
import { MeasurementCategoryBreadcrumbs } from "@/components/config/measurements/detail/measurement-category-breadcrumbs";
import { MeasurementCategoryDetailHeader } from "@/components/config/measurements/detail/measurement-category-detail-header";
import { MeasurementFieldsStatsGrid } from "@/components/config/measurements/detail/measurement-fields-stats-grid";
import { MeasurementFieldsTable } from "@/components/config/measurements/detail/measurement-fields-table";
import { MeasurementSectionsManager } from "@/components/config/measurements/detail/measurement-sections-manager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell, PageSection } from "@/components/ui/page-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import { useAuthz } from "@/hooks/use-authz";
import { Typography } from "@/components/ui/typography";
import { useMeasurementCategoryDetailPage } from "@/hooks/use-measurement-category-detail-page";

export function MeasurementCategoryDetail({ id }: { id: string }) {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageMeasurements = canAll(["measurements.manage"]);

  const {
    loading,
    category,
    notFound,
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
    fetchCategory,
  } = useMeasurementCategoryDetailPage(id);

  const [isSectionDeleteOpen, setIsSectionDeleteOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<MeasurementSection | null>(
    null,
  );
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
    ? sectionFieldCounts.get(sectionToDelete.id) ?? 0
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

  if (!loading && notFound) {
    return (
      <PageShell width="narrow">
        <PageSection spacing="compact">
          <Card>
            <CardContent className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
              <Typography as="h2" variant="sectionTitle">
                Category Not Found
              </Typography>
              <Typography as="p" variant="lead" className="mt-2 max-w-md">
                This measurement category may have been removed or is no longer available.
              </Typography>
              <Button
                variant="premium"
                className="mt-6 w-full sm:w-auto"
                onClick={() => router.push("/settings/measurements")}
              >
                Back to Measurements
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    );
  }

  return (
    <PageShell spacing="spacious">
      <PageSection spacing="compact">
        <MeasurementCategoryBreadcrumbs
          categoryName={category?.name}
          onBack={() => router.push("/settings/measurements")}
        />

        <MeasurementCategoryDetailHeader
          category={category}
          onAddSection={openAddSectionDialog}
          onAddField={openAddFieldDialog}
          canManageMeasurements={canManageMeasurements}
        />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementFieldsStatsGrid fields={category?.fields || []} />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementSectionsManager
          sections={category?.sections ?? []}
          fields={category?.fields ?? []}
          loading={loading}
          canManageSections={canManageMeasurements}
          onAddSection={openAddSectionDialog}
          onEditSection={openEditSectionDialog}
          onDeleteSection={openDeleteSectionDialog}
          onAddFieldToSection={(sectionId) => openAddFieldDialog(sectionId)}
        />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementFieldsTable
          fields={category?.fields || []}
          sections={category?.sections || []}
          loading={loading}
          onEditField={openEditFieldDialog}
          onDeleteField={requestDeleteField}
          onMoveFieldSection={moveFieldToSection}
          canManageFields={canManageMeasurements}
        />
      </PageSection>

      {canManageMeasurements ? (
        <>
          <MeasurementFieldDialog
            open={isFieldDialogOpen}
            onOpenChange={closeFieldDialog}
            categoryId={id}
            categoryName={category?.name}
            initialData={selectedField}
            initialSectionId={preferredSectionId}
            existingFields={category?.fields || []}
            existingSections={category?.sections || []}
            onSuccess={() => {
              void fetchCategory();
            }}
          />

          <MeasurementSectionDialog
            open={isSectionDialogOpen}
            onOpenChange={closeSectionDialog}
            categoryId={id}
            initialSection={selectedSection}
            onSuccess={() => {
              void fetchCategory();
            }}
          />

          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={closeDeleteConfirm}
            title="Delete Field"
            description={`Are you sure you want to delete the field "${fieldToDelete?.label}"? This action cannot be undone.`}
            onConfirm={() => {
              void confirmDeleteField();
            }}
            confirmText="Delete Field"
          />

          <ScrollableDialog
            open={isSectionDeleteOpen}
            onOpenChange={closeDeleteSectionDialog}
            title="Delete Section"
            description={
              sectionToDelete
                ? `Remove "${sectionToDelete.name}" section from ${category?.name ?? "this category"}.`
                : undefined
            }
            maxWidthClass="sm:max-w-lg"
            footerActions={
              <div className="flex w-full justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => closeDeleteSectionDialog(false)}
                  disabled={isDeletingSection}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    void confirmDeleteSection();
                  }}
                  disabled={
                    isDeletingSection ||
                    cannotDeleteSection ||
                    (requiresMoveTarget && !targetSectionId)
                  }
                >
                  {isDeletingSection ? "Deleting..." : "Delete Section"}
                </Button>
              </div>
            }
          >
            {cannotDeleteSection ? (
              <Typography as="p" variant="body" className="text-destructive">
                This section contains {fieldsInDeletingSection} field
                {fieldsInDeletingSection === 1 ? "" : "s"}, but there is no
                other section to move them into. Create another section first.
              </Typography>
            ) : (
              <div className="space-y-4">
                <Typography as="p" variant="body">
                  {requiresMoveTarget
                    ? `This section has ${fieldsInDeletingSection} field${fieldsInDeletingSection === 1 ? "" : "s"}. Choose where these fields should move before deletion.`
                    : "This section has no active fields and will be removed immediately."}
                </Typography>

                {requiresMoveTarget ? (
                  <div className="space-y-2">
                    <Typography
                      as="p"
                      variant="muted"
                      className="font-semibold uppercase tracking-[0.08em]"
                    >
                      Move existing fields to
                    </Typography>
                    <Select
                      value={targetSectionId}
                      onValueChange={setTargetSectionId}
                    >
                      <SelectTrigger variant="premium">
                        <SelectValue placeholder="Select destination section" />
                      </SelectTrigger>
                      <SelectContent>
                        {deleteSectionTargetOptions.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            )}
          </ScrollableDialog>
        </>
      ) : null}
    </PageShell>
  );
}
