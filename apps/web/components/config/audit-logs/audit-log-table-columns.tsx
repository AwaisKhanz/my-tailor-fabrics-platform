"use client";

import type { AuditLogEntry, JsonValue } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import type { ColumnDef } from "@tbms/ui/components/data-table";
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
      header: "Timestamp",
      cell: (record) => (
        <span className="text-sm font-medium text-foreground">
          {formatDateTime(record.createdAt)}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (record) => (
        <Badge variant={getActionBadgeVariant(record.action)}>
          {record.action}
        </Badge>
      ),
    },
    {
      header: "Entity",
      cell: (record) => (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{record.entity}</p>
          <p className="text-xs text-muted-foreground">{record.entityId}</p>
        </div>
      ),
    },
    {
      header: "Actor",
      cell: (record) => (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            {record.user?.name ||
              (record.actorEmail ? "Unknown account" : "Unknown user")}
          </p>
          <p className="text-xs text-muted-foreground">
            {record.user?.email || record.actorEmail || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Change Summary",
      cell: (record) => (
        <span className="line-clamp-2 text-sm text-muted-foreground">
          {getChangeSummary(record)}
        </span>
      ),
    },
    {
      header: "Source",
      cell: (record) => (
        <div className="space-y-0.5 text-right">
          <p className="text-sm font-medium text-foreground">
            {record.ipAddress || "Unknown IP"}
          </p>
          <p className="line-clamp-1 max-w-[240px] text-xs text-muted-foreground">
            {record.userAgent || "User agent unavailable"}
          </p>
        </div>
      ),
      align: "right",
    },
  ];
}
