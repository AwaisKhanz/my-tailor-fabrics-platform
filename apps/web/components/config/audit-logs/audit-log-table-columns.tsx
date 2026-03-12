"use client";

import type { AuditLogEntry, JsonValue } from "@tbms/shared-types";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { formatDateTime } from "@/lib/utils";

const ACTION_SUMMARY_MAP: Record<string, string> = {
  LOGIN: "Session authentication event",
  TOKEN_REFRESH: "Access token refresh event",
  LOGOUT: "Session logout event",
  LOGIN_FAILED: "Failed login attempt",
};

const ACTION_BADGE_VARIANT_MAP: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  LOGIN: "secondary",
  TOKEN_REFRESH: "secondary",
  LOGOUT: "secondary",
  LOGIN_FAILED: "destructive",
};

function isJsonRecord(
  value: JsonValue | null | undefined,
): value is Record<string, JsonValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toRecord(
  value: JsonValue | null | undefined,
): Record<string, JsonValue> | null {
  if (isJsonRecord(value)) {
    return value;
  }

  return null;
}

function getChangeSummary(record: AuditLogEntry): string {
  const summary = ACTION_SUMMARY_MAP[record.action];
  if (summary) {
    return summary;
  }

  const oldValue = toRecord(record.oldValue);
  const newValue = toRecord(record.newValue);
  const fields = new Set<string>([
    ...Object.keys(oldValue ?? {}),
    ...Object.keys(newValue ?? {}),
  ]);

  if (fields.size === 0) {
    return record.entityId ? `Target ${record.entityId}` : "No payload";
  }

  const fieldList = Array.from(fields);
  if (fieldList.length <= 3) {
    return fieldList.join(", ");
  }

  return `${fieldList.slice(0, 3).join(", ")} +${fieldList.length - 3} more`;
}

function getActionBadgeVariant(
  action: string,
): "default" | "secondary" | "destructive" | "outline" {
  return ACTION_BADGE_VARIANT_MAP[action.toUpperCase()] ?? "outline";
}

export function createAuditLogColumns(): ColumnDef<AuditLogEntry>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <Badge variant={getActionBadgeVariant(row.original.action)}>
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{row.original.entity}</p>
          <p className="text-xs text-muted-foreground">{row.original.entityId}</p>
        </div>
      ),
    },
    {
      id: "actor",
      accessorFn: (record) => record.user?.name || record.actorEmail || "Unknown user",
      header: "Actor",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {row.original.user?.name ||
              (row.original.actorEmail ? "Unknown account" : "Unknown user")}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.user?.email || row.original.actorEmail || "—"}
          </p>
        </div>
      ),
    },
    {
      id: "changeSummary",
      accessorFn: (record) => getChangeSummary(record),
      enableSorting: false,
      header: "Change Summary",
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {getChangeSummary(row.original)}
        </span>
      ),
    },
    {
      id: "source",
      accessorFn: (record) => record.ipAddress || "Unknown IP",
      enableSorting: false,
      header: "Source",
      cell: ({ row }) => (
        <div className="space-y-0.5 text-right">
          <p className="text-sm font-medium text-foreground">
            {row.original.ipAddress || "Unknown IP"}
          </p>
          <p className="line-clamp-1 max-w-[240px] text-xs text-muted-foreground">
            {row.original.userAgent || "User agent unavailable"}
          </p>
        </div>
      ),
    },
  ];
}
