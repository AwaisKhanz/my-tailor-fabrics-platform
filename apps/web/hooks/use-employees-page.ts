"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useEmployeesList } from "@/hooks/queries/employee-queries";

const PAGE_SIZE = 10;

export function useEmployeesPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const employeesQuery = useEmployeesList({
    search: search.trim() || undefined,
    page,
    limit: pageSize,
  });

  const loading = employeesQuery.isLoading;
  const employees = employeesQuery.data?.success
    ? employeesQuery.data.data.data
    : [];
  const total = employeesQuery.data?.success
    ? employeesQuery.data.data.total
    : 0;

  const fetchEmployees = useCallback(async () => {
    try {
      await employeesQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  }, [employeesQuery, toast]);

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const openAddDialog = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback((open: boolean) => {
    setAddDialogOpen(open);
  }, []);

  const hasActiveFilters = useMemo(() => search.trim().length > 0, [search]);

  return {
    loading,
    employees,
    total,
    page,
    pageSize,
    search,
    addDialogOpen,
    hasActiveFilters,
    setPage,
    setSearchFilter,
    resetFilters,
    openAddDialog,
    closeAddDialog,
    fetchEmployees,
  };
}
