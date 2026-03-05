"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmployeeAssignedItemsResult } from "@tbms/shared-types";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";
import { useUrlTableState } from "@/hooks/use-url-table-state";

export type MyAssignedWorkItem = EmployeeAssignedItemsResult["data"][number];

const PAGE_SIZE = 10;

export function useMyOrdersPage() {
  const { toast } = useToast();
  const { values, setValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MyAssignedWorkItem[]>([]);
  const search = values.search;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getAssignedItems();
      if (response.success) {
        setItems(response.data.data ?? []);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load your assigned orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchMyOrders();
  }, [fetchMyOrders]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.order.orderNumber.toLowerCase().includes(query) ||
        item.garmentTypeName.toLowerCase().includes(query),
    );
  }, [items, search]);

  const filteredTotal = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setValues({ page: String(totalPages) });
    }
  }, [page, setValues, totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const setSearchFilter = useCallback((value: string) => {
    setValues({
      search: value,
      page: "1",
    });
  }, [setValues]);

  const clearSearch = useCallback(() => {
    setValues({
      search: "",
      page: "1",
    });
  }, [setValues]);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  return {
    loading,
    page,
    pageSize,
    search,
    items,
    filteredItems,
    filteredTotal,
    pagedItems,
    setPage,
    setSearchFilter,
    clearSearch,
    fetchMyOrders,
  };
}
