"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Branch } from "@tbms/shared-types";
import { branchesApi } from "@/lib/api/branches";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

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

function parseApiErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return typeof response?.data?.message === "string" ? response.data.message : undefined;
}

function isLegacyBranchListResponse(value: unknown): value is { data: Branch[]; total: number } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeValue = value as { data?: unknown; total?: unknown };
  return Array.isArray(maybeValue.data) && typeof maybeValue.total === "number";
}

export function useBranchesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [currentPage, setCurrentPage] = useState(1);

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
        limit: ITEMS_PER_PAGE,
      });

      const payload = response.data as unknown;
      if (isLegacyBranchListResponse(payload)) {
        setBranches(payload.data);
        setTotalCount(payload.total);
      } else {
        const currentPayload = response.data;
        setBranches(currentPayload.data);
        setTotalCount(currentPayload.total);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, toast]);

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
    setSearch(value);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCurrentPage(1);
  }, []);

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
    setSaving(true);
    try {
      if (editingBranch) {
        await branchesApi.updateBranch(editingBranch.id, {
          name: form.name.trim(),
          address: form.address.trim() || undefined,
          phone: form.phone.trim() || undefined,
        });
        toast({ title: "Branch updated" });
      } else {
        await branchesApi.createBranch({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          address: form.address.trim() || undefined,
          phone: form.phone.trim() || undefined,
        });
        toast({ title: "Branch created" });
      }

      handleDialogOpenChange(false);
      await fetchBranches();
    } catch (error) {
      toast({
        title: "Error",
        description: parseApiErrorMessage(error) ?? "Failed to save",
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
        description: parseApiErrorMessage(error) ?? "Failed to delete branch",
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
    itemsPerPage: ITEMS_PER_PAGE,
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
