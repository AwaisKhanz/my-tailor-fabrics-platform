"use client";

import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Filter, XCircle } from "lucide-react";
import { BranchDeleteSummary } from "@/components/config/branches/branch-delete-summary";
import { BranchFormDialog } from "@/components/config/branches/branch-form-dialog";
import { BranchesDirectoryTable } from "@/components/config/branches/branches-directory-table";
import { BranchesListToolbar } from "@/components/config/branches/branches-list-toolbar";
import { BranchesPageHeader } from "@/components/config/branches/branches-page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { TableSurface } from "@/components/ui/table-layout";
import { useBranchesPage } from "@/hooks/use-branches-page";

export function BranchesTable() {
  const router = useRouter();

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

  const activeOnPage = branches.filter((branch) => branch.isActive).length;
  const inactiveOnPage = branches.length - activeOnPage;

  return (
    <PageShell>
      <PageSection spacing="compact">
        <BranchesPageHeader onCreate={openCreateDialog} />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid auto-rows-fr grid-cols-1 space-y-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Total Branches"
          subtitle="Across organization"
          value={totalCount}
          tone="primary"
          icon={<Building2 className="h-4 w-4" />}
        />

        <StatCard
          title="Active (Page)"
          subtitle="Visible in listing"
          value={activeOnPage}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />

        <StatCard
          title="Inactive (Page)"
          subtitle="Needs reactivation"
          value={inactiveOnPage}
          tone="warning"
          icon={<XCircle className="h-4 w-4" />}
        />

        <StatCard
          title="Filters"
          subtitle={hasActiveFilters ? "Search applied" : "Default state"}
          value={hasActiveFilters ? "Active" : "Clear"}
          tone="info"
          icon={<Filter className="h-4 w-4" />}
        />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface className="border-border/70 bg-card/95">
          <BranchesListToolbar
            totalCount={totalCount}
            search={search}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={updateSearch}
            onResetFilters={resetFilters}
          />

          <BranchesDirectoryTable
            branches={branches}
            loading={loading}
            page={currentPage}
            total={totalCount}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            onOpenBranch={(branch) => router.push(`/settings/branches/${branch.id}`)}
            onEdit={openEditDialog}
            onDelete={requestDelete}
            onToggleActive={toggleBranchActive}
          />
        </TableSurface>
      </PageSection>

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
    </PageShell>
  );
}
