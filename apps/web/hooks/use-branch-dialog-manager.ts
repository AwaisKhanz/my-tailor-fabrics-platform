"use client";

import { useCallback, useState } from "react";
import {
  branchCreateFormSchema,
  branchUpdateFormSchema,
  type Branch,
} from "@tbms/shared-types";
import type { useToast } from "@/hooks/use-toast";
import {
  useCreateBranch,
  useUpdateBranch,
} from "@/hooks/queries/branch-queries";
import { getApiErrorMessage } from "@/lib/utils/error";

export interface BranchFormState {
  code: string;
  name: string;
  address: string;
  phone: string;
}

type BranchFieldErrors = Partial<Record<keyof BranchFormState, string>>;
type ToastFn = ReturnType<typeof useToast>["toast"];

export const EMPTY_BRANCH_FORM: BranchFormState = {
  code: "",
  name: "",
  address: "",
  phone: "",
};

interface UseBranchDialogManagerParams {
  fetchBranches: () => Promise<void>;
  toast: ToastFn;
}

export function useBranchDialogManager({
  fetchBranches,
  toast,
}: UseBranchDialogManagerParams) {
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormState>(EMPTY_BRANCH_FORM);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<BranchFieldErrors>({});
  const saving =
    createBranchMutation.isPending || updateBranchMutation.isPending;

  const openCreateDialog = useCallback(() => {
    setEditingBranch(null);
    setForm(EMPTY_BRANCH_FORM);
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      code: branch.code,
      name: branch.name,
      address: branch.address ?? "",
      phone: branch.phone ?? "",
    });
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingBranch(null);
      setForm(EMPTY_BRANCH_FORM);
      setFieldErrors({});
      setFormError("");
    }
  }, []);

  const updateFormField = useCallback(
    <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => {
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
      setFormError("");
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    [],
  );

  const saveBranch = useCallback(async () => {
    let createData: ReturnType<typeof branchCreateFormSchema.parse> | null =
      null;
    let updateData: ReturnType<typeof branchUpdateFormSchema.parse> | null =
      null;

    if (editingBranch) {
      const parsedUpdate = branchUpdateFormSchema.safeParse(form);
      if (!parsedUpdate.success) {
        const flattenedErrors = parsedUpdate.error.flatten().fieldErrors;
        setFieldErrors({
          name: flattenedErrors.name?.[0],
          address: flattenedErrors.address?.[0],
          phone: flattenedErrors.phone?.[0],
        });
        setFormError(
          flattenedErrors.name?.[0] ??
            flattenedErrors.address?.[0] ??
            flattenedErrors.phone?.[0] ??
            "Fix the highlighted fields and try again.",
        );
        return;
      }

      updateData = parsedUpdate.data;
    } else {
      const parsedCreate = branchCreateFormSchema.safeParse(form);
      if (!parsedCreate.success) {
        const flattenedErrors = parsedCreate.error.flatten().fieldErrors;
        setFieldErrors({
          code: flattenedErrors.code?.[0],
          name: flattenedErrors.name?.[0],
          address: flattenedErrors.address?.[0],
          phone: flattenedErrors.phone?.[0],
        });
        setFormError(
          flattenedErrors.code?.[0] ??
            flattenedErrors.name?.[0] ??
            flattenedErrors.address?.[0] ??
            flattenedErrors.phone?.[0] ??
            "Fix the highlighted fields and try again.",
        );
        return;
      }

      createData = parsedCreate.data;
    }

    setFieldErrors({});
    setFormError("");
    try {
      if (editingBranch && updateData) {
        await updateBranchMutation.mutateAsync({
          id: editingBranch.id,
          data: {
            name: updateData.name,
            address: updateData.address || undefined,
            phone: updateData.phone || undefined,
          },
        });
        toast({ title: "Branch updated" });
      } else if (createData) {
        await createBranchMutation.mutateAsync({
          code: createData.code.toUpperCase(),
          name: createData.name,
          address: createData.address || undefined,
          phone: createData.phone || undefined,
        });
        toast({ title: "Branch created" });
      }

      handleDialogOpenChange(false);
      await fetchBranches();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error) ?? "Failed to save",
        variant: "destructive",
      });
    }
  }, [
    createBranchMutation,
    editingBranch,
    fetchBranches,
    form,
    handleDialogOpenChange,
    toast,
    updateBranchMutation,
  ]);

  return {
    dialogOpen,
    editingBranch,
    saving,
    form,
    formError,
    fieldErrors,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFormField,
    saveBranch,
  };
}
