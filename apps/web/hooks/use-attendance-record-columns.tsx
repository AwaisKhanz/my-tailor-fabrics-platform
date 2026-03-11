"use client";

import { useMemo } from "react";
import { Clock3, LogOut } from "lucide-react";
import { type AttendanceRecord } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { type ColumnDef } from "@tbms/ui/components/data-table";
import { formatDate, formatDateTime } from "@/lib/utils";

interface UseAttendanceRecordColumnsParams {
  canManageAttendanceEntries: boolean;
  clockingOutId: string | null;
  clockOut: (recordId: string) => Promise<void>;
}

export function useAttendanceRecordColumns({
  canManageAttendanceEntries,
  clockingOutId,
  clockOut,
}: UseAttendanceRecordColumnsParams) {
  return useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        header: "Date",
        cell: (record) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(record.date)}
          </span>
        ),
      },
      {
        header: "Employee",
        cell: (record) => (
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {record.employee?.fullName ?? "Unknown employee"}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.employee?.employeeCode ?? "No code"}
              {record.employee?.designation
                ? ` • ${record.employee.designation}`
                : ""}
            </p>
          </div>
        ),
      },
      {
        header: "Clock In",
        cell: (record) => (
          <span className="text-sm text-foreground">
            {formatDateTime(record.clockIn)}
          </span>
        ),
      },
      {
        header: "Clock Out",
        cell: (record) =>
          record.clockOut ? (
            <span className="text-sm text-foreground">
              {formatDateTime(record.clockOut)}
            </span>
          ) : (
            <Badge variant="secondary">
              In Progress
            </Badge>
          ),
      },
      {
        header: "Hours",
        align: "right",
        cell: (record) => (
          <span className="font-semibold text-foreground">
            {typeof record.hoursWorked === "number"
              ? `${record.hoursWorked.toFixed(2)}h`
              : "—"}
          </span>
        ),
      },
      {
        header: "Note",
        cell: (record) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {record.note || "—"}
          </span>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (record) =>
          record.clockOut ? (
            <span className="text-xs text-muted-foreground">Closed</span>
          ) : !canManageAttendanceEntries ? (
            <Badge variant="outline">
              Open
            </Badge>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={clockingOutId === record.id}
              onClick={(event) => {
                event.stopPropagation();
                void clockOut(record.id);
              }}
            >
              <LogOut className="h-4 w-4" />
              Clock Out
            </Button>
          ),
      },
    ],
    [canManageAttendanceEntries, clockOut, clockingOutId],
  );
}
