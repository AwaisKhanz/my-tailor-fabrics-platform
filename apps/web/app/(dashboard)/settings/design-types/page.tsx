"use client";

import { useRouter } from "next/navigation";
import { CreateDesignTypeDialog } from "@/components/design-types/CreateDesignTypeDialog";
import { DesignTypesPageHeader } from "@/components/design-types/design-types-page-header";
import { DesignTypesTable } from "@/components/design-types/design-types-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageShell } from "@/components/ui/page-shell";
import { useDesignTypesPage } from "@/hooks/use-design-types-page";

export default function DesignTypesPage() {
  const router = useRouter();

  const {
    loading,
    designTypes,
    garmentTypes,
    branches,
    createDialogOpen,
    selectedDesign,
    deleteTarget,
    deleting,
    openCreateDialog,
    openEditDialog,
    closeCreateDialog,
    saveDesignType,
    requestDeleteDesignType,
    closeDeleteDialog,
    confirmDeleteDesignType,
  } = useDesignTypesPage();

  return (
    <PageShell>
      <DesignTypesPageHeader onBack={() => router.back()} onCreate={openCreateDialog} />

      <DesignTypesTable
        loading={loading}
        designTypes={designTypes}
        garmentTypes={garmentTypes}
        branches={branches}
        onEdit={openEditDialog}
        onDelete={requestDeleteDesignType}
      />

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
