"use client";

import { GarmentPriceHistoryDialog } from "@/components/config/GarmentPriceHistoryDialog";
import { GarmentTypeDialog } from "@/components/config/GarmentTypeDialog";
import { GarmentWorkflowStepsDialog } from "@/components/config/GarmentWorkflowStepsDialog";
import { GarmentTypesInventoryTable } from "@/components/config/garments/list/garment-types-inventory-table";
import { GarmentTypesListToolbar } from "@/components/config/garments/list/garment-types-list-toolbar";
import { GarmentTypesPageHeader } from "@/components/config/garments/list/garment-types-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useGarmentTypesPage } from "@/hooks/use-garment-types-page";

export function GarmentTypesTable() {
  const {
    loading,
    garmentTypes,
    totalCount,
    search,
    currentPage,
    pageSize,
    hasActiveFilters,
    selectedType,
    typeToDelete,
    isDialogOpen,
    isHistoryOpen,
    isWorkflowOpen,
    isConfirmOpen,
    setCurrentPage,
    setSearchFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    openHistoryDialog,
    openWorkflowDialog,
    requestDelete,
    closeGarmentDialog,
    closeHistoryDialog,
    closeWorkflowDialog,
    closeConfirmDialog,
    fetchGarmentTypes,
    confirmDelete,
  } = useGarmentTypesPage();

  return (
    <PageShell>
      <GarmentTypesPageHeader onAdd={openCreateDialog} />

      <TableSurface>
        <GarmentTypesListToolbar
          totalCount={totalCount}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchFilter}
          onReset={resetFilters}
        />

        <GarmentTypesInventoryTable
          garmentTypes={garmentTypes}
          loading={loading}
          page={currentPage}
          total={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onEdit={openEditDialog}
          onOpenHistory={openHistoryDialog}
          onOpenWorkflow={openWorkflowDialog}
          onDelete={requestDelete}
        />
      </TableSurface>

      <GarmentTypeDialog
        open={isDialogOpen}
        onOpenChange={closeGarmentDialog}
        initialData={selectedType}
        onSuccess={() => {
          void fetchGarmentTypes();
        }}
      />

      <GarmentPriceHistoryDialog
        open={isHistoryOpen}
        onOpenChange={closeHistoryDialog}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
      />

      <GarmentWorkflowStepsDialog
        open={isWorkflowOpen}
        onOpenChange={closeWorkflowDialog}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
        initialSteps={selectedType?.workflowSteps || []}
        onSuccess={() => {
          void fetchGarmentTypes();
        }}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={closeConfirmDialog}
        title="Delete Garment Type"
        description={`Are you sure you want to delete "${typeToDelete?.name}"? This action cannot be undone.`}
        onConfirm={() => {
          void confirmDelete();
        }}
        confirmText="Delete Garment Type"
      />
    </PageShell>
  );
}
