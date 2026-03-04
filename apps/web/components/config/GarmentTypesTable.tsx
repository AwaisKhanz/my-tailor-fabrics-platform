"use client";

import { useRouter } from "next/navigation";
import { GarmentPriceHistoryDialog } from "@/components/config/GarmentPriceHistoryDialog";
import { GarmentTypeDialog } from "@/components/config/GarmentTypeDialog";
import { GarmentWorkflowStepsDialog } from "@/components/config/GarmentWorkflowStepsDialog";
import { GarmentTypesInventoryTable } from "@/components/config/garments/list/garment-types-inventory-table";
import { GarmentTypesListToolbar } from "@/components/config/garments/list/garment-types-list-toolbar";
import { GarmentTypesPageHeader } from "@/components/config/garments/list/garment-types-page-header";
import { GarmentTypesStatsGrid } from "@/components/config/garments/list/garment-types-stats-grid";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useGarmentTypesPage } from "@/hooks/use-garment-types-page";

export function GarmentTypesTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageGarments = canAll(["garments.manage"]);

  const {
    loading,
    garmentTypes,
    totalCount,
    stats,
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
      <PageSection spacing="compact">
        <GarmentTypesPageHeader onAdd={openCreateDialog} canCreate={canManageGarments} />
      </PageSection>

      <PageSection spacing="compact">
        <GarmentTypesStatsGrid
          stats={stats}
          visibleCount={garmentTypes.length}
          hasActiveFilters={hasActiveFilters}
        />
      </PageSection>

      <PageSection spacing="compact">
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
            onOpen={(garment) => router.push(`/settings/garments/${garment.id}`)}
            onEdit={openEditDialog}
            onOpenHistory={openHistoryDialog}
            onOpenWorkflow={openWorkflowDialog}
            onDelete={requestDelete}
            canManageGarments={canManageGarments}
          />
        </TableSurface>
      </PageSection>

      {canManageGarments ? (
        <GarmentTypeDialog
          open={isDialogOpen}
          onOpenChange={closeGarmentDialog}
          initialData={selectedType}
          onSuccess={() => {
            void fetchGarmentTypes();
          }}
        />
      ) : null}

      <GarmentPriceHistoryDialog
        open={isHistoryOpen}
        onOpenChange={closeHistoryDialog}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
      />

      {canManageGarments ? (
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
      ) : null}

      {canManageGarments ? (
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
      ) : null}
    </PageShell>
  );
}
