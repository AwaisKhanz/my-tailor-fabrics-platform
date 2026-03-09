"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Customer, CustomersListSummary, CustomerStatus } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { customerApi } from "@/lib/api/customers";
import { logDevError } from "@/lib/logger";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;
export const DEFAULT_CUSTOMER_STATUS_TAB: CustomerStatusTab =
  CustomerStatus.ACTIVE;

export type CustomerStatusTab = CustomerStatus | "ALL";

export const CUSTOMER_STATUS_TAB_VALUES: readonly CustomerStatusTab[] = [
  "ALL",
  CustomerStatus.ACTIVE,
  CustomerStatus.INACTIVE,
  CustomerStatus.BLACKLISTED,
];

export const CUSTOMER_STATUS_TAB_OPTIONS = CUSTOMER_STATUS_TAB_VALUES.map(
  (status) => ({
    key: status,
    label:
      status === "ALL"
        ? "All"
        : CUSTOMER_STATUS_LABELS[status],
  }),
);

export function isCustomerStatusTab(value: string): value is CustomerStatusTab {
  return CUSTOMER_STATUS_TAB_VALUES.some((status) => status === value);
}

function parseCustomerStatusTab(value: string): CustomerStatusTab {
  if (value === "ALL") {
    return "ALL";
  }

  return isCustomerStatusTab(value) ? value : DEFAULT_CUSTOMER_STATUS_TAB;
}

export function useCustomersPage() {
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      status: DEFAULT_CUSTOMER_STATUS_TAB,
    },
  });

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<CustomersListSummary>({
    totalCustomers: 0,
    whatsappConnectedCount: 0,
    vipCustomersCount: 0,
  });
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const statusTab = parseCustomerStatusTab(values.status);

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
        customerApi.getCustomers({
          page,
          limit: pageSize,
          search: filters.search,
          status: filters.status,
        }),
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
  }, [page, pageSize, search, statusTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchCustomers]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const setStatusFilter = useCallback((value: CustomerStatusTab) => {
    setValues({
      status: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

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
    () => search.trim().length > 0 || statusTab !== DEFAULT_CUSTOMER_STATUS_TAB,
    [search, statusTab],
  );

  return {
    loading,
    customers,
    total,
    summary,
    search,
    page,
    pageSize,
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
