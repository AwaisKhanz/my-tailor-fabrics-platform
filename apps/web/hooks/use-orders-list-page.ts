"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ordersApi } from "@/lib/api/orders";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderStatus } from "@tbms/shared-types";

const PAGE_SIZE = 10;

export type OrdersStatusFilter = OrderStatus | "ALL";
export type OrdersDateRange = "7" | "30" | "90" | "all";

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

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] =
    useState<OrdersStatusFilter>("ALL");
  const [dateRange, setDateRange] = useState<OrdersDateRange>("30");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getOrders({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
        from: getFromIsoByRange(dateRange),
        page,
        limit: PAGE_SIZE,
      });

      if (response.success) {
        setOrders(response.data.data);
        setTotal(response.data.total);
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
  }, [dateRange, page, search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: OrdersStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const setDate = useCallback((value: OrdersDateRange) => {
    setDateRange(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("ALL");
    setDateRange("30");
    setPage(1);
  }, []);

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
    pageSize: PAGE_SIZE,
    search,
    statusFilter,
    dateRange,
    activeFilterCount,
    setPage,
    setSearchFilter,
    setStatus,
    setDate,
    resetFilters,
  };
}
