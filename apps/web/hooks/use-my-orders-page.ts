"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";

export interface MyAssignedWorkItem {
  id: string;
  order: {
    id: string;
    orderNumber: string;
    dueDate: string;
  };
  garmentTypeName: string;
  description: string;
  status: string;
  dueDate?: string;
  employeeRate: number;
}

export function useMyOrdersPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MyAssignedWorkItem[]>([]);
  const [search, setSearch] = useState("");

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getAssignedItems();
      if (response.success) {
        setItems((response.data.data || []) as MyAssignedWorkItem[]);
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

  const setSearchFilter = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  return {
    loading,
    search,
    items,
    filteredItems,
    setSearchFilter,
    clearSearch,
    fetchMyOrders,
  };
}
