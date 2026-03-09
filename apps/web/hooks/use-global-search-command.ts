"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Customer, Employee, Order } from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { employeesApi } from "@/lib/api/employees";
import { ordersApi } from "@/lib/api/orders";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import {
  buildCustomerDetailRoute,
  buildEmployeeDetailRoute,
} from "@/lib/people-routes";

export interface GlobalSearchResults {
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  orders: [],
  customers: [],
  employees: [],
};

const SEARCH_LIMIT = 6;

interface UseGlobalSearchCommandParams {
  enableHotkeys: boolean;
}

export function useGlobalSearchCommand({
  enableHotkeys,
}: UseGlobalSearchCommandParams) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);

  const term = query.trim();
  const hasMinimumQuery = term.length >= 2;
  const resultCount =
    results.orders.length + results.customers.length + results.employees.length;

  const firstResultPath = useMemo(() => {
    if (results.orders[0]) {
      return buildOrderDetailRoute(results.orders[0].id);
    }
    if (results.customers[0]) {
      return buildCustomerDetailRoute(results.customers[0].id);
    }
    if (results.employees[0]) {
      return buildEmployeeDetailRoute(results.employees[0].id);
    }
    return null;
  }, [results]);

  useEffect(() => {
    if (!enableHotkeys) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const normalizedKey =
        typeof event.key === "string" ? event.key.toLowerCase() : "";

      if (normalizedKey === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enableHotkeys]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!hasMinimumQuery) {
      setLoading(false);
      setError(null);
      setResults(EMPTY_RESULTS);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const [ordersResponse, customersResponse, employeesResponse] =
          await Promise.all([
            ordersApi.getOrders({ page: 1, limit: SEARCH_LIMIT, search: term }),
            customerApi.getCustomers({
              page: 1,
              limit: SEARCH_LIMIT,
              search: term,
            }),
            employeesApi.getEmployees({
              page: 1,
              limit: SEARCH_LIMIT,
              search: term,
            }),
          ]);

        if (cancelled) {
          return;
        }

        setResults({
          orders: ordersResponse.success ? ordersResponse.data.data : [],
          customers: customersResponse.success ? customersResponse.data.data : [],
          employees: employeesResponse.success ? employeesResponse.data.data : [],
        });
      } catch {
        if (cancelled) {
          return;
        }

        setResults(EMPTY_RESULTS);
        setError("Search service is temporarily unavailable.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, hasMinimumQuery, term]);

  const updateQuery = useCallback((value: string) => {
    setQuery(value);
    if (!open) {
      setOpen(true);
    }
  }, [open]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setResults(EMPTY_RESULTS);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    containerRef,
    inputRef,
    open,
    query,
    loading,
    error,
    results,
    term,
    hasMinimumQuery,
    resultCount,
    firstResultPath,
    setOpen,
    updateQuery,
    clearQuery,
    close,
  };
}
