"use client";

import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Filter, XCircle } from "lucide-react";
import { BranchDeleteSummary } from "@/components/config/branches/branch-delete-summary";
import { BranchFormDialog } from "@/components/config/branches/branch-form-dialog";
import { BranchesDirectoryTable } from "@/components/config/branches/branches-directory-table";
import { BranchesListToolbar } from "@/components/config/branches/branches-list-toolbar";
import { BranchesPageHeader } from "@/components/config/branches/branches-page-header";
import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useAuthz } from "@/hooks/use-authz";
import { useBranchesPage } from "@/hooks/use-branches-page";
import { buildBranchHubRoute } from "@/lib/settings-routes";
import { PERMISSION } from "@tbms/shared-constants";

export function BranchesTable() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageBranches = canAll([PERMISSION["branches.manage"]]);

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
    formError,
    fieldErrors,
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
        <BranchesPageHeader
          onCreate={openCreateDialog}
          canCreate={canManageBranches}
        />
      </PageSection>

      <PageSection spacing="compact">
        <StatsGrid columns="four">
          <StatCard
            title="Total Branches"
            subtitle="Organization footprint"
            value={totalCount}
            helperText="Configured locations"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            title="Active (Page)"
            subtitle="Current listing"
            value={activeOnPage}
            helperText="Ready for operations"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="success"
          />
          <StatCard
            title="Inactive (Page)"
            subtitle="Current listing"
            value={inactiveOnPage}
            helperText="Requires reactivation"
            icon={<XCircle className="h-4 w-4" />}
            tone="warning"
          />
          <StatCard
            title="Filters"
            subtitle="Search state"
            value={hasActiveFilters ? "Active" : "Clear"}
            helperText={
              hasActiveFilters ? "Search applied" : "Using default listing"
            }
            icon={<Filter className="h-4 w-4" />}
            tone={hasActiveFilters ? "info" : "default"}
          />
        </StatsGrid>
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
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
            onOpenBranch={(branch) => router.push(buildBranchHubRoute(branch.id))}
            onEdit={openEditDialog}
            onDelete={requestDelete}
            onToggleActive={toggleBranchActive}
            canManageBranches={canManageBranches}
          />
        </TableSurface>
      </PageSection>

      {canManageBranches ? (
        <>
          <BranchFormDialog
            open={dialogOpen}
            editingBranch={editingBranch}
            saving={saving}
            form={form}
            formError={formError}
            fieldErrors={fieldErrors}
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
        </>
      ) : null}
    </PageShell>
  );
}
