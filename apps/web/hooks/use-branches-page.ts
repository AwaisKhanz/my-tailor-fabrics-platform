"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  branchCreateFormSchema,
  branchUpdateFormSchema,
  type Branch,
} from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/utils/error";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const ITEMS_PER_PAGE = 10;

export interface BranchFormState {
  code: string;
  name: string;
  address: string;
  phone: string;
}

export const EMPTY_BRANCH_FORM: BranchFormState = {
  code: "",
  name: "",
  address: "",
  phone: "",
};

export function useBranchesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(ITEMS_PER_PAGE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const currentPage = getPositiveInt("page", 1);
  const itemsPerPage = getPositiveInt("limit", ITEMS_PER_PAGE);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchFormState>(EMPTY_BRANCH_FORM);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchesApi.getBranches({
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      setBranches(response.data.data);
      setTotalCount(response.data.total);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, itemsPerPage, toast]);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const openCreateDialog = useCallback(() => {
    setEditingBranch(null);
    setForm(EMPTY_BRANCH_FORM);
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
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingBranch(null);
      setForm(EMPTY_BRANCH_FORM);
    }
  }, []);

  const updateSearch = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setCurrentPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const updateFormField = useCallback(
    <K extends keyof BranchFormState>(field: K, value: BranchFormState[K]) => {
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
        toast({
          title: "Validation error",
          description: getFirstZodErrorMessage(parsedUpdate.error),
          variant: "destructive",
        });
        return;
      }
      updateData = parsedUpdate.data;
    } else {
      const parsedCreate = branchCreateFormSchema.safeParse(form);
      if (!parsedCreate.success) {
        toast({
          title: "Validation error",
          description: getFirstZodErrorMessage(parsedCreate.error),
          variant: "destructive",
        });
        return;
      }
      createData = parsedCreate.data;
    }

    setSaving(true);
    try {
      if (editingBranch && updateData) {
        await branchesApi.updateBranch(editingBranch.id, {
          name: updateData.name,
          address: updateData.address || undefined,
          phone: updateData.phone || undefined,
        });
        toast({ title: "Branch updated" });
      } else if (createData) {
        await branchesApi.createBranch({
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
    } finally {
      setSaving(false);
    }
  }, [editingBranch, fetchBranches, form, handleDialogOpenChange, toast]);

  const requestDelete = useCallback((branch: Branch) => {
    setBranchToDelete(branch);
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!branchToDelete) {
      return;
    }

    try {
      await branchesApi.removeBranch(branchToDelete.id);
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
      setBranchToDelete(null);
      setIsConfirmOpen(false);
      await fetchBranches();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessage(error) ?? "Failed to delete branch",
        variant: "destructive",
      });
    }
  }, [branchToDelete, fetchBranches, toast]);

  const toggleBranchActive = useCallback(
    async (branch: Branch) => {
      try {
        await branchesApi.updateBranch(branch.id, { isActive: !branch.isActive });
        await fetchBranches();
      } catch {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    },
    [fetchBranches, toast],
  );

  return {
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
  };
}
