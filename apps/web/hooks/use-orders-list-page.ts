"use client";

import { useCallback, useMemo } from "react";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { OrderStatus } from "@tbms/shared-types";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useOrdersList, useOrdersSummary } from "@/hooks/queries/order-queries";

const PAGE_SIZE = 10;

export type OrdersStatusFilter = OrderStatus | "ALL";
export type OrdersDateRange = "7" | "30" | "90" | "all";
export type OrdersSortField =
  | "orderDate"
  | "dueDate"
  | "orderNumber"
  | "customer"
  | "totalAmount"
  | "status";
export type OrdersSortOrder = "asc" | "desc";

export const ORDER_SORT_FIELD_VALUES: readonly OrdersSortField[] = [
  "orderDate",
  "dueDate",
  "orderNumber",
  "customer",
  "totalAmount",
  "status",
];

export const ORDER_STATUS_FILTER_VALUES: readonly OrdersStatusFilter[] = [
  "ALL",
  OrderStatus.NEW,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.OVERDUE,
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

export const ORDERS_ALL_STATUSES_LABEL = "All Statuses";

export const ORDER_STATUS_FILTER_OPTIONS = ORDER_STATUS_FILTER_VALUES.map(
  (status) => ({
    value: status,
    label:
      status === "ALL"
        ? ORDERS_ALL_STATUSES_LABEL
        : ORDER_STATUS_CONFIG[status].label,
  }),
);

export const ORDER_DATE_RANGE_VALUES: readonly OrdersDateRange[] = [
  "7",
  "30",
  "90",
  "all",
];

export const ORDER_DATE_RANGE_OPTIONS = ORDER_DATE_RANGE_VALUES.map(
  (value) => ({
    value,
    label:
      value === "7"
        ? "Last 7 Days"
        : value === "30"
          ? "Last 30 Days"
          : value === "90"
            ? "Last 3 Months"
            : "All Time",
  }),
);

export function isOrdersStatusFilter(
  value: string,
): value is OrdersStatusFilter {
  return ORDER_STATUS_FILTER_VALUES.some((status) => status === value);
}

export function isOrdersDateRange(value: string): value is OrdersDateRange {
  return ORDER_DATE_RANGE_VALUES.some((range) => range === value);
}

function isOrdersSortField(value: string): value is OrdersSortField {
  return ORDER_SORT_FIELD_VALUES.some((field) => field === value);
}

function isOrdersSortOrder(value: string): value is OrdersSortOrder {
  return value === "asc" || value === "desc";
}

function parseOrdersStatusFilter(value: string): OrdersStatusFilter {
  if (value === "ALL") {
    return "ALL";
  }

  return isOrdersStatusFilter(value) ? value : "ALL";
}

function parseOrdersDateRange(value: string): OrdersDateRange {
  return isOrdersDateRange(value) ? value : "30";
}

function parseOrdersSortField(value: string): OrdersSortField {
  return isOrdersSortField(value) ? value : "orderDate";
}

function parseOrdersSortOrder(value: string): OrdersSortOrder {
  return isOrdersSortOrder(value) ? value : "desc";
}

function getFromIsoByRange(range: OrdersDateRange): string | undefined {
  if (range === "all") {
    return undefined;
  }

  const now = new Date();
  const days = Number(range);
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return from.toISOString();
}

export function useOrdersListPage() {
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      status: "ALL",
      range: "30",
      sortBy: "orderDate",
      sortOrder: "desc",
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const statusFilter = parseOrdersStatusFilter(values.status);
  const dateRange = parseOrdersDateRange(values.range);
  const sortBy = parseOrdersSortField(values.sortBy);
  const sortOrder = parseOrdersSortOrder(values.sortOrder);

  const baseFilters = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch.trim() || undefined,
      from: getFromIsoByRange(dateRange),
      sortBy,
      sortOrder,
    }),
    [dateRange, debouncedSearch, sortBy, sortOrder, statusFilter],
  );

  const summaryFilters = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch.trim() || undefined,
      from: getFromIsoByRange(dateRange),
    }),
    [dateRange, debouncedSearch, statusFilter],
  );

  const ordersQuery = useOrdersList({
    ...baseFilters,
    page,
    limit: pageSize,
  });

  const summaryQuery = useOrdersSummary(summaryFilters);

  const loading = ordersQuery.isLoading || summaryQuery.isLoading;
  const orders = ordersQuery.data?.success ? ordersQuery.data.data.data : [];
  const total = ordersQuery.data?.success ? ordersQuery.data.data.total : 0;
  const summary = summaryQuery.data?.success
    ? summaryQuery.data.data
    : {
        totalValue: 0,
        dueSoonCount: 0,
        overdueCount: 0,
        completedCount: 0,
      };

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setStatus = useCallback(
    (value: OrdersStatusFilter) => {
      setValues({
        status: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setDate = useCallback(
    (value: OrdersDateRange) => {
      setValues({
        range: value,
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

  const setSort = useCallback(
    (nextSortBy: OrdersSortField, nextSortOrder: OrdersSortOrder) => {
      setValues({
        sortBy: nextSortBy,
        sortOrder: nextSortOrder,
        page: "1",
      });
    },
    [setValues],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim().length > 0) {
      count += 1;
    }
    if (statusFilter !== "ALL") {
      count += 1;
    }
    if (dateRange !== "30") {
      count += 1;
    }
    return count;
  }, [dateRange, search, statusFilter]);

  return {
    loading,
    orders,
    total,
    page,
    pageSize,
    search,
    statusFilter,
    dateRange,
    sortBy,
    sortOrder,
    summary,
    activeFilterCount,
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    setSort,
    resetFilters,
  };
}
