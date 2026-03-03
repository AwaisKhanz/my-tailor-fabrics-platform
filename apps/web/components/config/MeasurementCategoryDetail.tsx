"use client";

import { MeasurementFieldDialog } from "@/components/config/MeasurementFieldDialog";
import { MeasurementCategoryBreadcrumbs } from "@/components/config/measurements/detail/measurement-category-breadcrumbs";
import { MeasurementCategoryDetailHeader } from "@/components/config/measurements/detail/measurement-category-detail-header";
import { MeasurementFieldsTable } from "@/components/config/measurements/detail/measurement-fields-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMeasurementCategoryDetailPage } from "@/hooks/use-measurement-category-detail-page";

export function MeasurementCategoryDetail({ id }: { id: string }) {
  const {
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
  } = useMeasurementCategoryDetailPage(id);

  return (
    <div className="space-y-8">
      <MeasurementCategoryBreadcrumbs categoryName={category?.name} />

      <MeasurementCategoryDetailHeader categoryName={category?.name} onAddField={openAddFieldDialog} />

      <MeasurementFieldsTable
        fields={category?.fields || []}
        loading={loading}
        onEditField={openEditFieldDialog}
        onDeleteField={requestDeleteField}
      />

      <MeasurementFieldDialog
        open={isFieldDialogOpen}
        onOpenChange={closeFieldDialog}
        categoryId={id}
        categoryName={category?.name}
        initialData={selectedField}
        existingFields={category?.fields || []}
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
    </div>
  );
}
