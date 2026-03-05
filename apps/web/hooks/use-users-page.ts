"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES } from "@tbms/shared-constants";
import {
  Role,
  userAccountCreateFormSchema,
  userAccountUpdateFormSchema,
  type UserAccount,
  type UserStatsSummary,
} from "@tbms/shared-types";
import { type Branch, branchesApi } from "@/lib/api/branches";
import { usersApi } from "@/lib/api/users";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

const PAGE_SIZE = 10;

export const USERS_ALL_BRANCHES_VALUE = "ALL_BRANCHES";
export const USERS_ALL_ROLES_FILTER_VALUE = "ALL_ROLES";

export type UserRoleFilter = Role | typeof USERS_ALL_ROLES_FILTER_VALUE;

export interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: Role;
  branchId: string;
}

export type UpdateUserFormField = <K extends keyof UserFormState>(
  field: K,
  value: UserFormState[K],
) => void;

export const EMPTY_USER_FORM: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: Role.ENTRY_OPERATOR,
  branchId: USERS_ALL_BRANCHES_VALUE,
};

function parseApiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : undefined;
}

export function useUsersPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<UserStatsSummary>({
    total: 0,
    active: 0,
    privileged: 0,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>(USERS_ALL_ROLES_FILTER_VALUE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersQuery = {
        page,
        limit: PAGE_SIZE,
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
  }, [page, roleFilter, search, toast]);

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

  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setForm(EMPTY_USER_FORM);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: UserAccount) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as Role,
      branchId: user.branchId ?? USERS_ALL_BRANCHES_VALUE,
    });
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingUser(null);
      setForm(EMPTY_USER_FORM);
    }
  }, []);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setRoleFilterValue = useCallback((value: string) => {
    if (value === USERS_ALL_ROLES_FILTER_VALUE || ROLES.some((role) => role.value === value)) {
      setRoleFilter(value as UserRoleFilter);
      setPage(1);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
    setRoleFilter(USERS_ALL_ROLES_FILTER_VALUE);
  }, []);

  const updateFormField = useCallback<UpdateUserFormField>((field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  }, []);

  const saveUser = useCallback(async () => {
    const parsedResult = editingUser
      ? userAccountUpdateFormSchema.safeParse(form)
      : userAccountCreateFormSchema.safeParse(form);

    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    const validated = parsedResult.data;

    setSaving(true);
    try {
      const payload = {
        name: validated.name,
        email: validated.email,
        password: validated.password?.trim() || undefined,
        role: validated.role,
        branchId:
          validated.branchId === USERS_ALL_BRANCHES_VALUE || !validated.branchId
            ? undefined
            : validated.branchId,
      };

      if (editingUser) {
        await usersApi.updateUser(editingUser.id, payload);
        toast({ title: "User updated successfully" });
      } else {
        await usersApi.createUser(payload);
        toast({ title: "User created successfully" });
      }

      handleDialogOpenChange(false);
      await fetchData();
    } catch (error) {
      const fallback = editingUser ? "Failed to update user" : "Failed to create user";
      toast({
        title: "Error",
        description: parseApiErrorMessage(error) ?? fallback,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editingUser, fetchData, form, handleDialogOpenChange, toast]);

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
    pageSize: PAGE_SIZE,
    roleFilter,
    hasActiveFilters,
    branches,
    dialogOpen,
    editingUser,
    form,
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
