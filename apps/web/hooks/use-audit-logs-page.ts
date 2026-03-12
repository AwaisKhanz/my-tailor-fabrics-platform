"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuditLogEntry, AuditLogsStats } from "@tbms/shared-types";
import { AUDIT_ACTIONS, AUDIT_FILTER_ENTITIES } from "@tbms/shared-constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useAuditLogs,
  useAuditLogsStats,
} from "@/hooks/queries/audit-log-queries";

const PAGE_SIZE = 20;
export const ALL_FILTER = "all";
export const AUDIT_ALL_ACTIONS_LABEL = "All Actions";
export const AUDIT_ALL_ENTITIES_LABEL = "All Entities";
const ALL_ACTIONS_FILTER_OPTION = {
  value: ALL_FILTER,
  label: AUDIT_ALL_ACTIONS_LABEL,
} as const;
const ALL_ENTITIES_FILTER_OPTION = {
  value: ALL_FILTER,
  label: AUDIT_ALL_ENTITIES_LABEL,
} as const;

type AuditFilterOption = {
  value: string;
  label: string;
};

type FiltersState = {
  search: string;
  action: string;
  entity: string;
  from: string;
  to: string;
};

const DEFAULT_FILTERS: FiltersState = {
  search: "",
  action: ALL_FILTER,
  entity: ALL_FILTER,
  from: "",
  to: "",
};

const DEFAULT_STATS: AuditLogsStats = {
  total: 0,
  createCount: 0,
  updateCount: 0,
  deleteCount: 0,
  loginCount: 0,
  uniqueUsers: 0,
};

export function useAuditLogsPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: DEFAULT_FILTERS.search,
      action: DEFAULT_FILTERS.action,
      entity: DEFAULT_FILTERS.entity,
      from: DEFAULT_FILTERS.from,
      to: DEFAULT_FILTERS.to,
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const debouncedSearch = useDebounce(values.search, 500);
  const filters = useMemo<FiltersState>(
    () => ({
      search: values.search,
      action: values.action || ALL_FILTER,
      entity: values.entity || ALL_FILTER,
      from: values.from,
      to: values.to,
    }),
    [values.action, values.entity, values.from, values.search, values.to],
  );

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      action: filters.action !== ALL_FILTER ? filters.action : undefined,
      entity: filters.entity !== ALL_FILTER ? filters.entity : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    }),
    [
      filters.action,
      filters.entity,
      filters.from,
      filters.to,
      debouncedSearch,
      page,
      pageSize,
    ],
  );

  const logsQuery = useAuditLogs(queryParams);
  const statsQuery = useAuditLogsStats({
    search: queryParams.search,
    action: queryParams.action,
    entity: queryParams.entity,
    from: queryParams.from,
    to: queryParams.to,
  });

  const loading = logsQuery.isLoading || statsQuery.isLoading;
  const records: AuditLogEntry[] = logsQuery.data?.success
    ? (logsQuery.data.data.data ?? [])
    : [];
  const total = logsQuery.data?.success ? (logsQuery.data.data.total ?? 0) : 0;
  const stats: AuditLogsStats = statsQuery.data?.success
    ? statsQuery.data.data
    : DEFAULT_STATS;

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([logsQuery.refetch(), statsQuery.refetch()]);
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to load audit logs.",
        ),
        variant: "destructive",
      });
    }
  }, [logsQuery, statsQuery, toast]);

  const setFilter = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setValues({
        [key]: value,
        page: "1",
      });
    },
    [setValues],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const actionOptions = useMemo(() => {
    const values = new Set<string>(AUDIT_ACTIONS);
    records.forEach((record) => values.add(record.action));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const entityOptions = useMemo(() => {
    const values = new Set<string>(AUDIT_FILTER_ENTITIES);
    records.forEach((record) => values.add(record.entity));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const actionFilterOptions = useMemo<AuditFilterOption[]>(
    () => [
      ALL_ACTIONS_FILTER_OPTION,
      ...actionOptions.map((action) => ({ value: action, label: action })),
    ],
    [actionOptions],
  );

  const entityFilterOptions = useMemo<AuditFilterOption[]>(
    () => [
      ALL_ENTITIES_FILTER_OPTION,
      ...entityOptions.map((entity) => ({ value: entity, label: entity })),
    ],
    [entityOptions],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.action !== ALL_FILTER) count += 1;
    if (filters.entity !== ALL_FILTER) count += 1;
    if (filters.from) count += 1;
    if (filters.to) count += 1;
    return count;
  }, [
    filters.action,
    filters.entity,
    filters.from,
    filters.search,
    filters.to,
  ]);

  return {
    loading,
    records,
    total,
    stats,
    page,
    pageSize,
    filters,
    activeFilterCount,
    actionFilterOptions,
    entityFilterOptions,
    setPage,
    setFilter,
    resetFilters,
    refresh: fetchData,
  };
}
