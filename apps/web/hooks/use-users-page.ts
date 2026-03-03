"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES } from "@tbms/shared-constants";
import { Role, type UserAccount, type UserStatsSummary } from "@tbms/shared-types";
import { type Branch, branchesApi } from "@/lib/api/branches";
import { usersApi } from "@/lib/api/users";
import { logDevError } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<UserStatsSummary>({
    total: 0,
    active: 0,
    privileged: 0,
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>(USERS_ALL_ROLES_FILTER_VALUE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, branchesResponse, statsResponse] = await Promise.all([
        usersApi.getUsers(),
        branchesApi.getBranches(),
        usersApi.getStats(),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data.data);
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
  }, [toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === USERS_ALL_ROLES_FILTER_VALUE || user.role === roleFilter;
      if (!matchesRole) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        user.name,
        user.email,
        user.role,
        user.branch?.name ?? "",
        user.branch?.code ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [roleFilter, search, users]);

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
  }, []);

  const setRoleFilterValue = useCallback((value: string) => {
    if (value === USERS_ALL_ROLES_FILTER_VALUE || ROLES.some((role) => role.value === value)) {
      setRoleFilter(value as UserRoleFilter);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setRoleFilter(USERS_ALL_ROLES_FILTER_VALUE);
  }, []);

  const updateFormField = useCallback<UpdateUserFormField>((field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  }, []);

  const saveUser = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        role: form.role,
        branchId:
          form.branchId === USERS_ALL_BRANCHES_VALUE || !form.branchId
            ? undefined
            : form.branchId,
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
    users: filteredUsers,
    totalUsers: users.length,
    filteredUsersCount: filteredUsers.length,
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
  };
}
