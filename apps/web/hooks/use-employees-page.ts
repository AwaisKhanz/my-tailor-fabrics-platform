"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Employee } from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export function useEmployeesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getEmployees({
        search: search.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      });

      if (response.success) {
        setEmployees(response.data.data);
        setTotal(response.data.total);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEmployees();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchEmployees]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

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
    pageSize: PAGE_SIZE,
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
