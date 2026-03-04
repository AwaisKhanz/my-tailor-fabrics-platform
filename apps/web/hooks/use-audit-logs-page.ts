"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuditLogEntry, AuditLogsStats } from "@tbms/shared-types";
import {
  AUDIT_ACTIONS,
  AUDIT_FILTER_ENTITIES,
} from "@tbms/shared-constants";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;
export const ALL_FILTER = "all";

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

type ApiError = {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const response = (error as ApiError).response;
  const message = response?.data?.message;
  if (Array.isArray(message) && message.length > 0) {
    return message[0] ?? fallback;
  }
  if (typeof message === "string" && message.length > 0) {
    return message;
  }
  return fallback;
}

export function useAuditLogsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AuditLogsStats>(DEFAULT_STATS);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: filters.search.trim() || undefined,
        action: filters.action !== ALL_FILTER ? filters.action : undefined,
        entity: filters.entity !== ALL_FILTER ? filters.entity : undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      };

      const [logsResponse, statsResponse] = await Promise.all([
        auditLogsApi.getLogs(params),
        auditLogsApi.getStats(params),
      ]);

      if (logsResponse.success) {
        setRecords(logsResponse.data ?? []);
        setTotal(logsResponse.total ?? 0);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to load audit logs."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters.action, filters.entity, filters.from, filters.search, filters.to, page, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const setFilter = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setFilters((previous) => ({ ...previous, [key]: value }));
      setPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

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

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.action !== ALL_FILTER) count += 1;
    if (filters.entity !== ALL_FILTER) count += 1;
    if (filters.from) count += 1;
    if (filters.to) count += 1;
    return count;
  }, [filters.action, filters.entity, filters.from, filters.search, filters.to]);

  return {
    loading,
    records,
    total,
    stats,
    page,
    pageSize: PAGE_SIZE,
    filters,
    activeFilterCount,
    actionOptions,
    entityOptions,
    setPage,
    setFilter,
    resetFilters,
    refresh: fetchData,
  };
}
