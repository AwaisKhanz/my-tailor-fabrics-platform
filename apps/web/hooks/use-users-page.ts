"use client";

import { useCallback, useMemo, useState } from "react";
import { isRole, ROLES } from "@tbms/shared-constants";
import { Role, type UserAccount } from "@tbms/shared-types";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useUserAccountManager } from "@/hooks/use-user-account-manager";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useBranchesList } from "@/hooks/queries/branch-queries";
import {
  useRemoveUser,
  useSetUserActive,
  useUsersList,
  useUsersStats,
} from "@/hooks/queries/user-queries";

const PAGE_SIZE = 10;

export const USERS_ALL_BRANCHES_VALUE = "ALL_BRANCHES";
export const USERS_ALL_ROLES_FILTER_VALUE = "ALL_ROLES";
export const USERS_ALL_BRANCHES_LABEL = "All Branches";
export const USERS_ALL_ROLES_LABEL = "All Roles";

export type UserRoleFilter = Role | typeof USERS_ALL_ROLES_FILTER_VALUE;

export const USER_ROLE_FILTER_OPTIONS = [
  {
    value: USERS_ALL_ROLES_FILTER_VALUE,
    label: USERS_ALL_ROLES_LABEL,
  },
  ...ROLES,
];

function parseUserRoleFilter(value: string): UserRoleFilter {
  if (value === USERS_ALL_ROLES_FILTER_VALUE) {
    return USERS_ALL_ROLES_FILTER_VALUE;
  }

  return isRole(value) ? value : USERS_ALL_ROLES_FILTER_VALUE;
}

export function useUsersPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      role: USERS_ALL_ROLES_FILTER_VALUE,
    },
  });

  const search = values.search;
  const debouncedSearch = useDebounce(search, 300);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const roleFilter = parseUserRoleFilter(values.role);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const usersQuery = useUsersList({
    page,
    limit: pageSize,
    search: debouncedSearch.trim() || undefined,
    role: roleFilter === USERS_ALL_ROLES_FILTER_VALUE ? undefined : roleFilter,
  });
  const branchesQuery = useBranchesList({ page: 1, limit: 100 });
  const statsQuery = useUsersStats();
  const removeUserMutation = useRemoveUser();
  const setUserActiveMutation = useSetUserActive();

  const loading =
    usersQuery.isLoading || branchesQuery.isLoading || statsQuery.isLoading;
  const users: UserAccount[] = usersQuery.data?.success
    ? usersQuery.data.data.data
    : [];
  const total = usersQuery.data?.success ? usersQuery.data.data.total : 0;
  const branches = branchesQuery.data?.success
    ? branchesQuery.data.data.data
    : [];
  const stats = statsQuery.data?.success
    ? statsQuery.data.data
    : {
        total: 0,
        active: 0,
        privileged: 0,
      };

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        usersQuery.refetch(),
        branchesQuery.refetch(),
        statsQuery.refetch(),
      ]);
    } catch (error) {
      logDevError("Failed to load user management data:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  }, [branchesQuery, statsQuery, toast, usersQuery]);

  const hasActiveFilters = useMemo(
    () =>
      search.trim().length > 0 || roleFilter !== USERS_ALL_ROLES_FILTER_VALUE,
    [roleFilter, search],
  );

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const setRoleFilterValue = useCallback(
    (value: string) => {
      if (
        value === USERS_ALL_ROLES_FILTER_VALUE ||
        ROLES.some((role) => role.value === value)
      ) {
        setValues({
          role: value,
          page: "1",
        });
      }
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const {
    saving,
    dialogOpen,
    editingUser,
    form,
    formError,
    fieldErrors,
    userBranchOptions,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveUser,
  } = useUserAccountManager({
    branches,
    refreshUsers: fetchData,
  });

  const requestDelete = useCallback((user: UserAccount) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await removeUserMutation.mutateAsync(userToDelete.id);
      toast({
        title: "Success",
        description: "User account deleted",
      });
      setUserToDelete(null);
      setIsConfirmOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  }, [removeUserMutation, toast, userToDelete]);

  const toggleUserActive = useCallback(
    async (user: UserAccount, isActive: boolean) => {
      try {
        await setUserActiveMutation.mutateAsync({ id: user.id, isActive });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        });
      }
    },
    [setUserActiveMutation, toast],
  );

  return {
    loading,
    saving,
    stats,
    users,
    totalUsersCount: total,
    search,
    page,
    pageSize,
    roleFilter,
    hasActiveFilters,
    branches,
    userBranchOptions,
    dialogOpen,
    editingUser,
    form,
    formError,
    fieldErrors,
    isConfirmOpen,
    userToDelete,
    setSearchFilter,
    setPage,
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
  };
}
