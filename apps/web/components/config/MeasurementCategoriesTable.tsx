"use client";

import { useRouter } from "next/navigation";
import { MeasurementCategoryDialog } from "@/components/config/MeasurementCategoryDialog";
import { MeasurementCategoriesInventoryTable } from "@/components/config/measurements/list/measurement-categories-inventory-table";
import { MeasurementCategoriesListToolbar } from "@/components/config/measurements/list/measurement-categories-list-toolbar";
import { MeasurementCategoriesPageHeader } from "@/components/config/measurements/list/measurement-categories-page-header";
import { MeasurementCategoriesStatsGrid } from "@/components/config/measurements/list/measurement-categories-stats-grid";
import { SetupFlowBanner } from "@/components/config/setup/setup-flow-banner";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useMeasurementCategoriesPage } from "@/hooks/use-measurement-categories-page";
import { buildMeasurementCategoryRoute } from "@/lib/settings-routes";
import { PERMISSION } from '@tbms/shared-constants';

export function MeasurementCategoriesTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageMeasurements = canAll([PERMISSION["measurements.manage"]]);

  const {
    loading,
    categories,
    total,
    stats,
    search,
    includeArchived,
    activeFilterCount,
    restoringId,
    page,
    pageSize,
    hasActiveFilters,
    isDialogOpen,
    selectedCategory,
    isConfirmOpen,
    categoryToDelete,
    setPage,
    setSearchFilter,
    setIncludeArchived,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    requestDelete,
    closeConfirm,
    confirmDelete,
    restoreCategory,
    fetchCategories,
  } = useMeasurementCategoriesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <MeasurementCategoriesPageHeader
          onAdd={openCreateDialog}
          canCreate={canManageMeasurements}
        />
      </PageSection>

      <PageSection spacing="compact">
        <SetupFlowBanner
          title="Start the tailoring setup here"
          description="Measurement categories define the sizing forms your staff will use later when garments and customers are created."
          currentStep="Measurements"
          nextStep="Garments link these measurement categories together"
          sequence={["Measurements", "Garments", "Production Steps", "Labor Rates", "Orders"]}
        />
      </PageSection>

      <PageSection spacing="compact">
        <MeasurementCategoriesStatsGrid
          stats={stats}
          visibleOnPage={categories.length}
          hasActiveFilters={hasActiveFilters}
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <MeasurementCategoriesListToolbar
            total={total}
            search={search}
            includeArchived={includeArchived}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearchFilter}
            onIncludeArchivedChange={setIncludeArchived}
            onReset={resetFilters}
          />

          <MeasurementCategoriesInventoryTable
            categories={categories}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onView={(category) => {
              router.push(buildMeasurementCategoryRoute(category.id));
            }}
            onEdit={openEditDialog}
            onDelete={requestDelete}
            onRestore={restoreCategory}
            restoringId={restoringId}
            canManageMeasurements={canManageMeasurements}
          />
        </TableSurface>
      </PageSection>

      {canManageMeasurements ? (
        <>
          <MeasurementCategoryDialog
            open={isDialogOpen}
            onOpenChange={closeDialog}
            initialData={selectedCategory}
            onSuccess={() => {
              void fetchCategories();
            }}
          />

          <ConfirmDialog
            open={isConfirmOpen}
            onOpenChange={closeConfirm}
            title="Archive Category"
            description={`Archive "${categoryToDelete?.name}"? It will be hidden from new forms but historical measurements remain.`}
            onConfirm={() => {
              void confirmDelete();
            }}
            confirmText="Archive Category"
          />
        </>
      ) : null}
    </PageShell>
  );
}
