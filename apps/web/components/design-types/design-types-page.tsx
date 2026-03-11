"use client";

import { CreateDesignTypeDialog } from "@/components/design-types/CreateDesignTypeDialog";
import { DesignTypesPageHeader } from "@/components/design-types/design-types-page-header";
import { DesignTypesStatsGrid } from "@/components/design-types/design-types-stats-grid";
import { DesignTypesTable } from "@/components/design-types/design-types-table";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { useDesignTypesPage } from "@/hooks/use-design-types-page";
import { PERMISSION } from "@tbms/shared-constants";

export function DesignTypesPage() {
  const { canAll } = useAuthz();
  const canManageDesignTypes = canAll([PERMISSION["designTypes.manage"]]);

  const {
    loading,
    designTypes,
    pagedDesignTypes,
    totalCount,
    garmentTypes,
    branches,
    search,
    page,
    pageSize,
    hasActiveFilters,
    createDialogOpen,
    selectedDesign,
    deleteTarget,
    deleting,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    setPage,
    setSearchFilter,
    resetFilters,
    saveDesignType,
    requestDeleteDesignType,
    closeDeleteDialog,
    confirmDeleteDesignType,
  } = useDesignTypesPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <DesignTypesPageHeader
          onCreate={openCreateDialog}
          canCreateDesignType={canManageDesignTypes}
        />
      </PageSection>

      <PageSection spacing="compact">
        <DesignTypesStatsGrid
          designTypes={designTypes}
          hasActiveFilters={hasActiveFilters}
        />
      </PageSection>

      <PageSection spacing="compact">
        <DesignTypesTable
          loading={loading}
          designTypes={pagedDesignTypes}
          total={totalCount}
          page={page}
          pageSize={pageSize}
          garmentTypes={garmentTypes}
          branches={branches}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onPageChange={setPage}
          onSearchChange={setSearchFilter}
          onResetFilters={resetFilters}
          onEdit={openEditDialog}
          onDelete={requestDeleteDesignType}
          canManageDesignTypes={canManageDesignTypes}
        />
      </PageSection>

      {canManageDesignTypes ? (
        <>
          <CreateDesignTypeDialog
            open={createDialogOpen}
            onOpenChange={closeCreateDialog}
            onSubmit={saveDesignType}
            initialData={selectedDesign}
            garmentTypes={garmentTypes.map((garment) => ({
              id: garment.id,
              name: garment.name,
            }))}
            branches={branches.map((branch) => ({
              id: branch.id,
              name: branch.name,
              code: branch.code,
            }))}
          />

          <ConfirmDialog
            open={Boolean(deleteTarget)}
            onOpenChange={closeDeleteDialog}
            title="Remove this design type?"
            description={
              deleteTarget
                ? `This will permanently remove "${deleteTarget.name}" from your design catalog.`
                : "This action cannot be undone."
            }
            onConfirm={confirmDeleteDesignType}
            confirmText="Remove Design Type"
            variant="destructive"
            loading={deleting}
          />
        </>
      ) : null}
    </PageShell>
  );
}
