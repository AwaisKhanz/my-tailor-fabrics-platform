"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EmployeeAssignedItemsResult } from "@tbms/shared-types";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import { useMyItems } from "@/hooks/queries/employee-queries";

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

  const search = values.search;
  const debouncedSearch = useDebounce(search, 500);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const myItemsQuery = useMyItems();

  const loading = myItemsQuery.isLoading;
  const items: MyAssignedWorkItem[] = myItemsQuery.data?.success
    ? (myItemsQuery.data.data.data ?? [])
    : [];

  const fetchMyOrders = useCallback(async () => {
    try {
      await myItemsQuery.refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to load your assigned orders",
        variant: "destructive",
      });
    }
  }, [myItemsQuery, toast]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.order.orderNumber.toLowerCase().includes(query) ||
        item.garmentTypeName.toLowerCase().includes(query),
    );
  }, [debouncedSearch, items]);

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

  const setSearchFilter = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const clearSearch = useCallback(() => {
    setValues({
      search: "",
      page: "1",
    });
  }, [setValues]);

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

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
