"use client";

import { useCallback, useMemo, useState } from "react";
import { ROLES } from "@tbms/shared-constants";
import {
  Role,
  userAccountCreateFormSchema,
  userAccountUpdateFormSchema,
  type UserAccount,
} from "@tbms/shared-types";
import { useCreateUser, useUpdateUser } from "@/hooks/queries/user-queries";
import { getApiErrorMessage } from "@/lib/utils/error";
import { useToast } from "@/hooks/use-toast";

export const USERS_ALL_BRANCHES_VALUE = "ALL_BRANCHES";
export const USERS_ALL_BRANCHES_LABEL = "All Branches";
export const USERS_MASTER_ACCESS_LABEL = "Master Access";

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

interface UseUserAccountManagerParams {
  branches: { id: string; name: string; code: string }[];
  refreshUsers: () => Promise<void>;
}

export function useUserAccountManager({
  branches,
  refreshUsers,
}: UseUserAccountManagerParams) {
  const { toast } = useToast();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const saving = createUserMutation.isPending || updateUserMutation.isPending;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<UserFieldErrors>({});

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
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          data: payload,
        });
        toast({ title: "User updated successfully" });
      } else {
        await createUserMutation.mutateAsync(payload);
        toast({ title: "User created successfully" });
      }

      handleDialogOpenChange(false);
      await refreshUsers();
    } catch (error) {
      const fallback = editingUser
        ? "Failed to update user"
        : "Failed to create user";
      toast({
        title: "Error",
        description: getApiErrorMessage(error) ?? fallback,
        variant: "destructive",
      });
    }
  }, [
    createUserMutation,
    editingUser,
    form,
    handleDialogOpenChange,
    refreshUsers,
    toast,
    updateUserMutation,
  ]);

  return {
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
  };
}
