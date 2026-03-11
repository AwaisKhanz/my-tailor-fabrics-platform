"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  type GlobalSearchResults,
  useGlobalSearchResults,
} from "@/hooks/queries/search-queries";
import { buildOrderDetailRoute } from "@/lib/order-routes";
import {
  buildCustomerDetailRoute,
  buildEmployeeDetailRoute,
} from "@/lib/people-routes";

export type { GlobalSearchResults } from "@/hooks/queries/search-queries";

const EMPTY_RESULTS: GlobalSearchResults = {
  orders: [],
  customers: [],
  employees: [],
};

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

  const term = query.trim();
  const debouncedTerm = useDebounce(term, 260);
  const hasMinimumQuery = term.length >= 2;
  const searchQuery = useGlobalSearchResults(
    debouncedTerm,
    open && debouncedTerm.length >= 2,
  );
  const loading = searchQuery.isLoading || searchQuery.isFetching;
  const error = searchQuery.isError
    ? "Search service is temporarily unavailable."
    : null;
  const results: GlobalSearchResults = hasMinimumQuery
    ? searchQuery.data || EMPTY_RESULTS
    : EMPTY_RESULTS;
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

  const updateQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (!open) {
        setOpen(true);
      }
    },
    [open],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
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
