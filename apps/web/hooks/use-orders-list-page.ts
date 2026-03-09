"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ordersApi } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
import { Order, OrdersListSummary, OrderStatus } from "@tbms/shared-types";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

export type OrdersStatusFilter = OrderStatus | "ALL";
export type OrdersDateRange = "7" | "30" | "90" | "all";

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

export const ORDER_STATUS_FILTER_OPTIONS = ORDER_STATUS_FILTER_VALUES.filter(
  (status): status is OrderStatus => status !== "ALL",
);

export const ORDER_DATE_RANGE_VALUES: readonly OrdersDateRange[] = [
  "7",
  "30",
  "90",
  "all",
];

export const ORDER_DATE_RANGE_OPTIONS = ORDER_DATE_RANGE_VALUES.map((value) => ({
  value,
  label:
    value === "7"
      ? "Last 7 Days"
      : value === "30"
        ? "Last 30 Days"
        : value === "90"
          ? "Last 3 Months"
          : "All Time",
}));

export function isOrdersStatusFilter(value: string): value is OrdersStatusFilter {
  return ORDER_STATUS_FILTER_VALUES.some((status) => status === value);
}

export function isOrdersDateRange(value: string): value is OrdersDateRange {
  return ORDER_DATE_RANGE_VALUES.some((range) => range === value);
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
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      status: "ALL",
      range: "30",
    },
  });

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<OrdersListSummary>({
    totalValue: 0,
    dueSoonCount: 0,
    overdueCount: 0,
    completedCount: 0,
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const search = values.search;
  const statusFilter = parseOrdersStatusFilter(values.status);
  const dateRange = parseOrdersDateRange(values.range);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const baseFilters = {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
        from: getFromIsoByRange(dateRange),
      };

      const [listResponse, summaryResponse] = await Promise.all([
        ordersApi.getOrders({
          ...baseFilters,
          page,
          limit: pageSize,
        }),
        ordersApi.getOrdersSummary(baseFilters),
      ]);

      if (listResponse.success) {
        setOrders(listResponse.data.data);
        setTotal(listResponse.data.total);
      }
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, page, pageSize, search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const setStatus = useCallback((value: OrdersStatusFilter) => {
    setValues({
      status: value,
      page: "1",
    });
  }, [setValues]);

  const setDate = useCallback((value: OrdersDateRange) => {
    setValues({
      range: value,
      page: "1",
    });
  }, [setValues]);

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

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
    summary,
    activeFilterCount,
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    resetFilters,
  };
}
