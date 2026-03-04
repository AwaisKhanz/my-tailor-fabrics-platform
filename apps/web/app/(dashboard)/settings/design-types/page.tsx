"use client";

import { CreateDesignTypeDialog } from "@/components/design-types/CreateDesignTypeDialog";
import { DesignTypesPageHeader } from "@/components/design-types/design-types-page-header";
import { DesignTypesStatsGrid } from "@/components/design-types/design-types-stats-grid";
import { DesignTypesTable } from "@/components/design-types/design-types-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { useAuthz } from "@/hooks/use-authz";
import { useDesignTypesPage } from "@/hooks/use-design-types-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function DesignTypesPage() {
  const { canAll } = useAuthz();
  const canManageDesignTypes = canAll(["designTypes.manage"]);

  const {
    loading,
    designTypes,
    garmentTypes,
    branches,
    search,
    hasActiveFilters,
    createDialogOpen,
    selectedDesign,
    deleteTarget,
    deleting,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
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
          designTypes={designTypes}
          garmentTypes={garmentTypes}
          branches={branches}
          search={search}
          hasActiveFilters={hasActiveFilters}
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
            garmentTypes={garmentTypes.map((garment) => ({ id: garment.id, name: garment.name }))}
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
                ? `This will permanently remove \"${deleteTarget.name}\" from your design catalog.`
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

export default withRoleGuard(DesignTypesPage, {
  all: ["settings.read", "designTypes.read"],
});
