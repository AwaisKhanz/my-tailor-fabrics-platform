"use client";

import { useCallback, useMemo, useState } from "react";
import { Role, type Branch, type ShopFabric } from "@tbms/shared-types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthz } from "@/hooks/use-authz";
import { useBranchesList } from "@/hooks/queries/branch-queries";
import {
  useCreateShopFabric,
  useShopFabricStats,
  useShopFabricsList,
  useUpdateShopFabric,
} from "@/hooks/queries/fabric-queries";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useBranchStore } from "@/store/useBranchStore";

const ITEMS_PER_PAGE = 10;

export interface ShopFabricFormValues {
  branchId: string;
  name: string;
  brand: string;
  sellingRate: string;
  isActive: boolean;
  notes: string;
}

function buildDefaultFabricForm(branchId?: string): ShopFabricFormValues {
  return {
    branchId: branchId ?? "",
    name: "",
    brand: "",
    sellingRate: "",
    isActive: true,
    notes: "",
  };
}

function toFabricFormValues(fabric: ShopFabric): ShopFabricFormValues {
  return {
    branchId: fabric.branchId,
    name: fabric.name,
    brand: fabric.brand ?? "",
    sellingRate: String(fabric.sellingRate / 100),
    isActive: fabric.isActive,
    notes: fabric.notes ?? "",
  };
}

function validateFabricForm(
  values: ShopFabricFormValues,
): Partial<Record<keyof ShopFabricFormValues, string>> {
  const fieldErrors: Partial<Record<keyof ShopFabricFormValues, string>> = {};

  if (!values.branchId.trim()) {
    fieldErrors.branchId = "Branch is required.";
  }

  if (!values.name.trim()) {
    fieldErrors.name = "Fabric name is required.";
  }

  const parsedRate = Number(values.sellingRate.trim());
  if (!values.sellingRate.trim()) {
    fieldErrors.sellingRate = "Selling rate is required.";
  } else if (!Number.isFinite(parsedRate) || parsedRate < 0) {
    fieldErrors.sellingRate = "Selling rate must be zero or greater.";
  }

  return fieldErrors;
}

export function useFabricsPage() {
  const { role } = useAuthz();
  const activeBranchId = useBranchStore((state) => state.activeBranchId);
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(ITEMS_PER_PAGE),
      search: "",
    },
  });

  const search = values.search;
  const debouncedSearch = useDebounce(search, 400);
  const currentPage = getPositiveInt("page", 1);
  const itemsPerPage = getPositiveInt("limit", ITEMS_PER_PAGE);

  const branchesQuery = useBranchesList({ page: 1, limit: 100 });
  const branches = branchesQuery.data?.success ? branchesQuery.data.data.data : [];
  const defaultBranchId = activeBranchId ?? branches[0]?.id ?? "";
  const isSuperAdmin = role === Role.SUPER_ADMIN;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<ShopFabric | null>(null);
  const [fabricForm, setFabricForm] = useState<ShopFabricFormValues>(() =>
    buildDefaultFabricForm(defaultBranchId),
  );
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ShopFabricFormValues, string>>
  >({});

  const listQuery = useShopFabricsList({
    search: debouncedSearch.trim() || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });
  const statsQuery = useShopFabricStats({
    search: debouncedSearch.trim() || undefined,
  });

  const createMutation = useCreateShopFabric();
  const updateMutation = useUpdateShopFabric();

  const loading =
    listQuery.isLoading || statsQuery.isLoading || branchesQuery.isLoading;
  const saving = createMutation.isPending || updateMutation.isPending;

  const paginated = listQuery.data?.success ? listQuery.data.data : null;
  const fabrics = paginated?.data ?? [];
  const totalCount = paginated?.total ?? 0;
  const stats = statsQuery.data?.success
    ? statsQuery.data.data
    : {
        totalItems: 0,
        activeItems: 0,
        inactiveItems: 0,
      };

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      listQuery.refetch(),
      statsQuery.refetch(),
      branchesQuery.refetch(),
    ]);
  }, [branchesQuery, listQuery, statsQuery]);

  const resetFabricDialogState = useCallback(() => {
    setEditingFabric(null);
    setFabricForm(buildDefaultFabricForm(defaultBranchId));
    setFormError("");
    setFieldErrors({});
  }, [defaultBranchId]);

  const openCreateDialog = useCallback(() => {
    setEditingFabric(null);
    setFabricForm(buildDefaultFabricForm(defaultBranchId));
    setFormError("");
    setFieldErrors({});
    setDialogOpen(true);
  }, [defaultBranchId]);

  const openEditDialog = useCallback((fabric: ShopFabric) => {
    setEditingFabric(fabric);
    setFabricForm(toFabricFormValues(fabric));
    setFormError("");
    setFieldErrors({});
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
      if (!open) {
        resetFabricDialogState();
      }
    },
    [resetFabricDialogState],
  );

  const updateFabricField = useCallback(
    <K extends keyof ShopFabricFormValues>(
      field: K,
      value: ShopFabricFormValues[K],
    ) => {
      setFabricForm((current) => ({
        ...current,
        [field]: value,
      }));
      setFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
      setFormError("");
    },
    [],
  );

  const saveFabric = useCallback(async () => {
    const nextFieldErrors = validateFabricForm(fabricForm);
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      setFormError("Please correct the highlighted fabric fields.");
      return;
    }

    const payload = {
      branchId: fabricForm.branchId.trim(),
      name: fabricForm.name.trim(),
      brand: fabricForm.brand.trim() || undefined,
      sellingRate: Number(fabricForm.sellingRate.trim()),
      isActive: fabricForm.isActive,
      notes: fabricForm.notes.trim() || undefined,
    };

    try {
      if (editingFabric) {
        await updateMutation.mutateAsync({ id: editingFabric.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setDialogOpen(false);
      resetFabricDialogState();
      await refreshData();
    } catch (error) {
      setFormError(
        getApiErrorMessageOrFallback(
          error,
          editingFabric
            ? "Unable to update fabric pricing."
            : "Unable to create fabric pricing.",
        ),
      );
    }
  }, [
    createMutation,
    editingFabric,
    fabricForm,
    refreshData,
    resetFabricDialogState,
    updateMutation,
  ]);

  const setSearchFilter = useCallback(
    (nextSearch: string) => {
      setValues({
        search: nextSearch,
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

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const branchMap = useMemo(() => {
    return new Map(branches.map((branch) => [branch.id, branch]));
  }, [branches]);

  const branchSelectDisabled = !isSuperAdmin;

  return {
    loading,
    saving,
    fabrics,
    totalCount,
    currentPage,
    itemsPerPage,
    search,
    hasActiveFilters,
    stats,
    branches,
    branchMap,
    branchSelectDisabled,
    dialogOpen,
    editingFabric,
    fabricForm,
    formError,
    fieldErrors,
    setSearchFilter,
    setPage,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    handleDialogOpenChange,
    updateFabricField,
    saveFabric,
    activeBranchId: defaultBranchId,
  } satisfies {
    loading: boolean;
    saving: boolean;
    fabrics: ShopFabric[];
    totalCount: number;
    currentPage: number;
    itemsPerPage: number;
    search: string;
    hasActiveFilters: boolean;
    stats: {
      totalItems: number;
      activeItems: number;
      inactiveItems: number;
    };
    branches: Branch[];
    branchMap: Map<string, Branch>;
    branchSelectDisabled: boolean;
    dialogOpen: boolean;
    editingFabric: ShopFabric | null;
    fabricForm: ShopFabricFormValues;
    formError: string;
    fieldErrors: Partial<Record<keyof ShopFabricFormValues, string>>;
    setSearchFilter: (value: string) => void;
    setPage: (page: number) => void;
    resetFilters: () => void;
    openCreateDialog: () => void;
    openEditDialog: (fabric: ShopFabric) => void;
    handleDialogOpenChange: (open: boolean) => void;
    updateFabricField: <K extends keyof ShopFabricFormValues>(
      field: K,
      value: ShopFabricFormValues[K],
    ) => void;
    saveFabric: () => Promise<void>;
    activeBranchId: string;
  };
}
