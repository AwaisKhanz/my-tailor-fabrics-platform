"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Customer, CustomersListSummary, CustomerStatus } from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { logDevError } from "@/lib/logger";

const PAGE_SIZE = 10;
const DEFAULT_STATUS_TAB: CustomerStatusTab = CustomerStatus.ACTIVE;

export type CustomerStatusTab = CustomerStatus | "ALL";

export function useCustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<CustomersListSummary>({
    totalCustomers: 0,
    whatsappConnectedCount: 0,
    vipCustomersCount: 0,
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<CustomerStatusTab>(DEFAULT_STATUS_TAB);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: search.trim() || undefined,
        status: statusTab === "ALL" ? undefined : statusTab,
      };

      const [listResponse, summaryResponse] = await Promise.all([
        customerApi.getCustomers(
          page,
          PAGE_SIZE,
          filters.search,
          filters.status,
        ),
        customerApi.getCustomersSummary(filters),
      ]);

      if (listResponse.success) {
        setCustomers(listResponse.data.data);
        setTotal(listResponse.data.total);
      }

      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    } catch (error) {
      logDevError("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchCustomers]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setStatusFilter = useCallback((value: CustomerStatusTab) => {
    setStatusTab(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusTab(DEFAULT_STATUS_TAB);
    setPage(1);
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCustomer(null);
    }
  }, []);

  const hasActiveFilters = useMemo(
    () => search.trim().length > 0 || statusTab !== DEFAULT_STATUS_TAB,
    [search, statusTab],
  );

  return {
    loading,
    customers,
    total,
    summary,
    search,
    page,
    pageSize: PAGE_SIZE,
    statusTab,
    isDialogOpen,
    selectedCustomer,
    hasActiveFilters,
    setPage,
    setSearchFilter,
    setStatusFilter,
    resetFilters,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    fetchCustomers,
  };
}
