"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isRole, ROLES } from "@tbms/shared-constants";
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
import { getApiErrorMessage } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

export const USERS_ALL_BRANCHES_VALUE = "ALL_BRANCHES";
export const USERS_ALL_ROLES_FILTER_VALUE = "ALL_ROLES";
export const USERS_ALL_BRANCHES_LABEL = "All Branches";
export const USERS_MASTER_ACCESS_LABEL = "Master Access";

export type UserRoleFilter = Role | typeof USERS_ALL_ROLES_FILTER_VALUE;

export const USER_ROLE_FILTER_OPTIONS = [
  {
    value: USERS_ALL_ROLES_FILTER_VALUE,
    label: "All Roles",
  },
  ...ROLES,
];
const ALL_BRANCHES_OPTION = {
  value: USERS_ALL_BRANCHES_VALUE,
  label: USERS_ALL_BRANCHES_LABEL,
} as const;

export interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: Role;
  branchId: string;
}
type UserFieldErrors = Partial<Record<keyof UserFormState, string>>;

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
  const [saving, setSaving] = useState(false);
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});

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

  const userBranchOptions = useMemo(
    () => [
      ALL_BRANCHES_OPTION,
      ...branches
        .filter((branch) => branch.id)
        .map((branch) => ({
          value: branch.id,
          label: `${branch.name} (${branch.code})`,
        })),
    ],
    [branches],
  );

  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setForm(EMPTY_USER_FORM);
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user: UserAccount) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      branchId: user.branchId ?? USERS_ALL_BRANCHES_VALUE,
    });
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingUser(null);
      setForm(EMPTY_USER_FORM);
      setFieldErrors({});
      setFormError("");
    }
  }, []);

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

  const updateFormField = useCallback<UpdateUserFormField>((field, value) => {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError("");
    setForm((previous) => ({ ...previous, [field]: value }));
  }, []);

  const saveUser = useCallback(async () => {
    const parsedResult = editingUser
      ? userAccountUpdateFormSchema.safeParse(form)
      : userAccountCreateFormSchema.safeParse(form);

    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setFieldErrors({
        name: flattenedErrors.name?.[0],
        email: flattenedErrors.email?.[0],
        password: flattenedErrors.password?.[0],
        role: flattenedErrors.role?.[0],
        branchId: flattenedErrors.branchId?.[0],
      });
      setFormError(
        flattenedErrors.name?.[0] ??
          flattenedErrors.email?.[0] ??
          flattenedErrors.password?.[0] ??
          flattenedErrors.role?.[0] ??
          flattenedErrors.branchId?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return;
    }

    const validated = parsedResult.data;
    setFieldErrors({});
    setFormError("");

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
        description: getApiErrorMessage(error) ?? fallback,
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
