"use client";

import { useRouter } from "next/navigation";
import { GarmentPriceHistoryDialog } from "@/components/config/GarmentPriceHistoryDialog";
import { GarmentTypeDialog } from "@/components/config/GarmentTypeDialog";
import { GarmentWorkflowStepsDialog } from "@/components/config/GarmentWorkflowStepsDialog";
import { GarmentTypesInventoryTable } from "@/components/config/garments/list/garment-types-inventory-table";
import { GarmentTypesListToolbar } from "@/components/config/garments/list/garment-types-list-toolbar";
import { GarmentTypesPageHeader } from "@/components/config/garments/list/garment-types-page-header";
import { GarmentTypesStatsGrid } from "@/components/config/garments/list/garment-types-stats-grid";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useGarmentTypesPage } from "@/hooks/use-garment-types-page";
import { buildGarmentSettingsDetailRoute } from "@/lib/settings-routes";
import { PERMISSION } from '@tbms/shared-constants';

export function GarmentTypesTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageGarments = canAll([PERMISSION["garments.manage"]]);

  const {
    loading,
    garmentTypes,
    totalCount,
    stats,
    search,
    includeArchived,
    activeFilterCount,
    currentPage,
    pageSize,
    hasActiveFilters,
    restoringId,
    selectedType,
    typeToDelete,
    isDialogOpen,
    isHistoryOpen,
    isWorkflowOpen,
    isConfirmOpen,
    setCurrentPage,
    setSearchFilter,
    setIncludeArchived,
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
    restoreType,
  } = useGarmentTypesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <GarmentTypesPageHeader
          onAdd={openCreateDialog}
          canCreate={canManageGarments}
        />
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
            includeArchived={includeArchived}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearchFilter}
            onIncludeArchivedChange={setIncludeArchived}
            onReset={resetFilters}
          />

          <GarmentTypesInventoryTable
            garmentTypes={garmentTypes}
            loading={loading}
            page={currentPage}
            total={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onOpen={(garment) => {
              if (!garment.deletedAt) {
                router.push(buildGarmentSettingsDetailRoute(garment.id));
              }
            }}
            onEdit={openEditDialog}
            onOpenHistory={openHistoryDialog}
            onOpenWorkflow={openWorkflowDialog}
            onDelete={requestDelete}
            onRestore={restoreType}
            restoringId={restoringId}
            canManageGarments={canManageGarments}
          />
        </TableSurface>
      </PageSection>

      <GarmentPriceHistoryDialog
        open={isHistoryOpen}
        onOpenChange={closeHistoryDialog}
        garmentId={selectedType?.id || ""}
        garmentName={selectedType?.name || ""}
      />

      {canManageGarments ? (
        <>
          <GarmentTypeDialog
            open={isDialogOpen}
            onOpenChange={closeGarmentDialog}
            initialData={selectedType}
            onSuccess={() => {
              void fetchGarmentTypes();
            }}
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
            title="Archive Garment Type"
            description={`Archive "${typeToDelete?.name}"? It will be hidden from new operations but history remains intact.`}
            onConfirm={() => {
              void confirmDelete();
            }}
            confirmText="Archive Garment Type"
          />
        </>
      ) : null}
    </PageShell>
  );
}
