"use client";

import { CreateDesignTypeDialog } from "@/components/design-types/CreateDesignTypeDialog";
import { DesignTypesPageHeader } from "@/components/design-types/design-types-page-header";
import { DesignTypesStatsGrid } from "@/components/design-types/design-types-stats-grid";
import { DesignTypesTable } from "@/components/design-types/design-types-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { useDesignTypesPage } from "@/hooks/use-design-types-page";

export default function DesignTypesPage() {
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
        <DesignTypesPageHeader onCreate={openCreateDialog} />
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
        />
      </PageSection>

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
    </PageShell>
  );
}
