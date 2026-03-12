"use client";

import { useCallback, useMemo, useState } from "react";
import { Customer, CustomerStatus } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { logDevError } from "@/lib/logger";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useCustomersList,
  useCustomersSummary,
} from "@/hooks/queries/customer-queries";

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

export const CUSTOMER_ALL_STATUSES_LABEL = "All Statuses";

export const CUSTOMER_STATUS_TAB_OPTIONS = CUSTOMER_STATUS_TAB_VALUES.map(
  (status) => ({
    key: status,
    label:
      status === "ALL"
        ? CUSTOMER_ALL_STATUSES_LABEL
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

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const statusTab = parseCustomerStatusTab(values.status);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status: statusTab === "ALL" ? undefined : statusTab,
    }),
    [debouncedSearch, statusTab],
  );

  const customersQuery = useCustomersList({
    page,
    limit: pageSize,
    search: filters.search,
    status: filters.status,
  });

  const summaryQuery = useCustomersSummary(filters);

  const loading = customersQuery.isLoading || summaryQuery.isLoading;
  const customers = customersQuery.data?.success
    ? customersQuery.data.data.data
    : [];
  const total = customersQuery.data?.success
    ? customersQuery.data.data.total
    : 0;
  const summary = summaryQuery.data?.success
    ? summaryQuery.data.data
    : {
        totalCustomers: 0,
        whatsappConnectedCount: 0,
        vipCustomersCount: 0,
      };

  const fetchCustomers = useCallback(async () => {
    try {
      await Promise.all([customersQuery.refetch(), summaryQuery.refetch()]);
    } catch (error) {
      logDevError("Failed to refetch customers:", error);
    }
  }, [customersQuery, summaryQuery]);

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setStatusFilter = useCallback(
    (value: CustomerStatusTab) => {
      setValues({
        status: value,
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
