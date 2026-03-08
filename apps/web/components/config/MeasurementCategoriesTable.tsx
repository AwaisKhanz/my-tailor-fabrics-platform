"use client";

import { useRouter } from "next/navigation";
import { MeasurementCategoryDialog } from "@/components/config/MeasurementCategoryDialog";
import { MeasurementCategoriesInventoryTable } from "@/components/config/measurements/list/measurement-categories-inventory-table";
import { MeasurementCategoriesListToolbar } from "@/components/config/measurements/list/measurement-categories-list-toolbar";
import { MeasurementCategoriesPageHeader } from "@/components/config/measurements/list/measurement-categories-page-header";
import { MeasurementCategoriesStatsGrid } from "@/components/config/measurements/list/measurement-categories-stats-grid";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { TableSurface } from "@/components/ui/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useMeasurementCategoriesPage } from "@/hooks/use-measurement-categories-page";
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
        <MeasurementCategoriesPageHeader onAdd={openCreateDialog} canCreate={canManageMeasurements} />
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
              router.push(`/settings/measurements/${category.id}`);
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
