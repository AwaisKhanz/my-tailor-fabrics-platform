"use client";

import { useMemo } from "react";
import { Clock3, LogOut } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { type AttendanceRecord } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: "employee",
        accessorFn: (record) => record.employee?.fullName ?? "Unknown employee",
        header: "Employee",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {row.original.employee?.fullName ?? "Unknown employee"}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.employee?.employeeCode ?? "No code"}
              {row.original.employee?.designation
                ? ` • ${row.original.employee.designation}`
                : ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "clockIn",
        header: "Clock In",
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatDateTime(row.original.clockIn)}
          </span>
        ),
      },
      {
        accessorKey: "clockOut",
        header: "Clock Out",
        cell: ({ row }) =>
          row.original.clockOut ? (
            <span className="text-sm text-foreground">
              {formatDateTime(row.original.clockOut)}
            </span>
          ) : (
            <Badge variant="secondary">
              In Progress
            </Badge>
          ),
      },
      {
        id: "hoursWorked",
        accessorFn: (record) =>
          typeof record.hoursWorked === "number" ? record.hoursWorked : -1,
        header: "Hours",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground tabular-nums">
            {typeof row.original.hoursWorked === "number"
              ? `${row.original.hoursWorked.toFixed(2)}h`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {row.original.note || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) =>
          row.original.clockOut ? (
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
              disabled={clockingOutId === row.original.id}
              onClick={(event) => {
                event.stopPropagation();
                void clockOut(row.original.id);
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
