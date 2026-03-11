"use client";

import { ConfirmDialog } from "@tbms/ui/components/confirm-dialog";
import { UserAccountDialog } from "@/components/config/users/user-account-dialog";
import { UsersAccessTable } from "@/components/config/users/users-access-table";
import { UsersListToolbar } from "@/components/config/users/users-list-toolbar";
import { UsersPageHeader } from "@/components/config/users/users-page-header";
import { UsersStatsGrid } from "@/components/config/users/users-stats-grid";
import { useUsersPage } from "@/hooks/use-users-page";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { TableSurface } from "@tbms/ui/components/table-layout";

export function UsersTable() {
  const {
    loading,
    saving,
    stats,
    users,
    totalUsersCount,
    search,
    page,
    pageSize,
    roleFilter,
    hasActiveFilters,
    userBranchOptions,
    dialogOpen,
    editingUser,
    form,
    formError,
    fieldErrors,
    isConfirmOpen,
    userToDelete,
    setPage,
    setSearchFilter,
    setRoleFilterValue,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveUser,
    requestDelete,
    setIsConfirmOpen,
    confirmDelete,
    toggleUserActive,
  } = useUsersPage();

  return (
    <PageShell>
      <PageSection spacing="compact">
        <UsersPageHeader onAddUser={openCreateDialog} />
      </PageSection>

      <PageSection spacing="compact">
        <UsersStatsGrid stats={stats} />
      </PageSection>

      <PageSection spacing="compact">
        <TableSurface>
          <UsersListToolbar
            search={search}
            roleFilter={roleFilter}
            totalUsersCount={totalUsersCount}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchFilter}
            onRoleFilterChange={setRoleFilterValue}
            onResetFilters={resetFilters}
          />

          <UsersAccessTable
            users={users}
            loading={loading}
            page={page}
            total={totalUsersCount}
            pageSize={pageSize}
            onEdit={openEditDialog}
            onDelete={requestDelete}
            onPageChange={setPage}
            onToggleActive={toggleUserActive}
          />
        </TableSurface>
      </PageSection>

      <UserAccountDialog
        open={dialogOpen}
        editingUser={editingUser}
        form={form}
        branchOptions={userBranchOptions}
        saving={saving}
        formError={formError}
        fieldErrors={fieldErrors}
        onOpenChange={handleDialogOpenChange}
        onFormFieldChange={updateFormField}
        onSave={() => {
          void saveUser();
        }}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete User Account"
        description={`Are you sure you want to delete ${userToDelete?.name}'s account? This will permanently revoke their access to the system.`}
        onConfirm={() => {
          void confirmDelete();
        }}
        confirmText="Delete Account"
      />
    </PageShell>
  );
}
