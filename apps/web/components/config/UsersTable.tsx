"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserAccountDialog } from "@/components/config/users/user-account-dialog";
import { UsersAccessTable } from "@/components/config/users/users-access-table";
import { UsersListToolbar } from "@/components/config/users/users-list-toolbar";
import { UsersPageHeader } from "@/components/config/users/users-page-header";
import { UsersStatsGrid } from "@/components/config/users/users-stats-grid";
import { useUsersPage } from "@/hooks/use-users-page";

export function UsersTable() {
  const {
    loading,
    saving,
    stats,
    users,
    totalUsers,
    filteredUsersCount,
    search,
    roleFilter,
    hasActiveFilters,
    branches,
    dialogOpen,
    editingUser,
    form,
    isConfirmOpen,
    userToDelete,
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
    <div className="space-y-6">
      <UsersPageHeader onAddUser={openCreateDialog} />

      <UsersStatsGrid stats={stats} />

      <UsersListToolbar
        search={search}
        roleFilter={roleFilter}
        totalUsers={totalUsers}
        filteredUsersCount={filteredUsersCount}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchFilter}
        onRoleFilterChange={setRoleFilterValue}
        onResetFilters={resetFilters}
      />

      <UsersAccessTable
        users={users}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={requestDelete}
        onToggleActive={toggleUserActive}
      />

      <UserAccountDialog
        open={dialogOpen}
        editingUser={editingUser}
        form={form}
        branches={branches}
        saving={saving}
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
    </div>
  );
}
