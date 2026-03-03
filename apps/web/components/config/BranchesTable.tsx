"use client";

import { BranchDeleteSummary } from "@/components/config/branches/branch-delete-summary";
import { BranchFormDialog } from "@/components/config/branches/branch-form-dialog";
import { BranchesDirectoryTable } from "@/components/config/branches/branches-directory-table";
import { BranchesListToolbar } from "@/components/config/branches/branches-list-toolbar";
import { BranchesPageHeader } from "@/components/config/branches/branches-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useBranchesPage } from "@/hooks/use-branches-page";

export function BranchesTable() {
  const {
    loading,
    saving,
    branches,
    totalCount,
    search,
    currentPage,
    itemsPerPage,
    hasActiveFilters,
    dialogOpen,
    editingBranch,
    form,
    isConfirmOpen,
    branchToDelete,
    setCurrentPage,
    setIsConfirmOpen,
    updateSearch,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveBranch,
    requestDelete,
    confirmDelete,
    toggleBranchActive,
  } = useBranchesPage();

  return (
    <div className="space-y-6">
      <BranchesPageHeader onCreate={openCreateDialog} />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <BranchesListToolbar
          totalCount={totalCount}
          search={search}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={updateSearch}
          onResetFilters={resetFilters}
        />

        <div className="p-6">
          <BranchesDirectoryTable
            branches={branches}
            loading={loading}
            page={currentPage}
            total={totalCount}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            onEdit={openEditDialog}
            onDelete={requestDelete}
            onToggleActive={toggleBranchActive}
          />
        </div>
      </div>

      <BranchFormDialog
        open={dialogOpen}
        editingBranch={editingBranch}
        saving={saving}
        form={form}
        onOpenChange={handleDialogOpenChange}
        onFieldChange={updateFormField}
        onSubmit={() => {
          void saveBranch();
        }}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Branch"
        description={<BranchDeleteSummary branch={branchToDelete} />}
        onConfirm={() => {
          void confirmDelete();
        }}
        confirmText="Delete Branch"
      />
    </div>
  );
}
