"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isRole, ROLES } from "@tbms/shared-constants";
import {
  Role,
  type UserAccount,
  type UserStatsSummary,
} from "@tbms/shared-types";
import { type Branch, branchesApi } from "@/lib/api/branches";
import { usersApi } from "@/lib/api/users";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import {
  USERS_MASTER_ACCESS_LABEL,
  useUserAccountManager,
} from "@/hooks/use-user-account-manager";
import { useUrlTableState } from "@/hooks/use-url-table-state";

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

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<UserStatsSummary>({
    total: 0,
    active: 0,
    privileged: 0,
  });

  const search = values.search;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const roleFilter = parseUserRoleFilter(values.role);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersQuery = {
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        role: roleFilter === USERS_ALL_ROLES_FILTER_VALUE ? undefined : roleFilter,
      };

      const [usersResponse, branchesResponse, statsResponse] = await Promise.all([
        usersApi.getUsers(usersQuery),
        branchesApi.getBranches(),
        usersApi.getStats(),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.data);
        setTotal(usersResponse.data.total);
      }

      if (branchesResponse.success) {
        setBranches(branchesResponse.data.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      logDevError("Failed to load user management data:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, roleFilter, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchData]);

  const hasActiveFilters = useMemo(
    () => search.trim().length > 0 || roleFilter !== USERS_ALL_ROLES_FILTER_VALUE,
    [roleFilter, search],
  );

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const setRoleFilterValue = useCallback((value: string) => {
    if (value === USERS_ALL_ROLES_FILTER_VALUE || ROLES.some((role) => role.value === value)) {
      setValues({
        role: value,
        page: "1",
      });
    }
  }, [setValues]);

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
      await usersApi.removeUser(userToDelete.id);
      toast({
        title: "Success",
        description: "User account deleted",
      });
      setUserToDelete(null);
      setIsConfirmOpen(false);
      await fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  }, [fetchData, toast, userToDelete]);

  const toggleUserActive = useCallback(
    async (user: UserAccount, isActive: boolean) => {
      try {
        await usersApi.setActive(user.id, isActive);
        await fetchData();
      } catch {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        });
      }
    },
    [fetchData, toast],
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
