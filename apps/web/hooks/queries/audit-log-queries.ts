"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "@/lib/api/audit-logs";
import { auditLogKeys } from "@/lib/query-keys";
import type { AuditLogsQueryInput } from "@tbms/shared-types";

// Audit logs are read-only — no mutations exposed here

export function useAuditLogs(params: AuditLogsQueryInput = {}) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogsApi.getLogs(params),
  });
}

export function useAuditLogsStats(
  params: Omit<AuditLogsQueryInput, "page" | "limit"> = {},
) {
  return useQuery({
    queryKey: auditLogKeys.stats(params),
    queryFn: () => auditLogsApi.getStats(params),
  });
}
