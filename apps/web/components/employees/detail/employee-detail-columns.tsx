"use client";

import { ChevronRight, RotateCcw } from "lucide-react";
import type {
  AttendanceRecord,
  EmployeeLedgerEntry,
  OrderItem,
  OrderItemTask,
  TaskStatus,
} from "@tbms/shared-types";
import { isTaskStatus } from "@tbms/shared-types";
import {
  LEDGER_ENTRY_TYPE_BADGE,
  LEDGER_ENTRY_TYPE_LABELS,
  TASK_STATUS_OPTIONS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@/components/ui/data-table";
import { FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatDateTime, formatPKR } from "@/lib/utils";

export function createEmployeeHistoryColumns(
  onViewOrder: (orderId: string) => void,
): ColumnDef<OrderItem>[] {
  return [
    {
      header: "Order #",
      cell: (item) => (
        <span className="font-bold">{item.order?.orderNumber || "-"}</span>
      ),
    },
    {
      header: "Garment",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.garmentTypeName}</span>
          <span className="text-xs text-muted-foreground">
            {item.completedAt
              ? `Completed: ${formatDate(item.completedAt)}`
              : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <Badge variant="outline" className="scale-90">
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Price",
      align: "right",
      cell: (item) => (
        <span className="text-right font-bold text-primary">
          {formatPKR(item.unitPrice)}
        </span>
      ),
    },
    {
      header: "",
      align: "right",
      cell: (item) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewOrder(item.orderId)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}

export function createEmployeeAttendanceColumns(): ColumnDef<AttendanceRecord>[] {
  return [
    {
      header: "Date",
      cell: (record) => (
        <span className="font-medium">{formatDate(record.date)}</span>
      ),
    },
    {
      header: "Clock In",
      cell: (record) => (
        <span className="text-xs font-medium text-primary">
          {new Date(record.clockIn).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      header: "Clock Out",
      cell: (record) => (
        <span className="text-xs font-medium text-destructive">
          {record.clockOut
            ? new Date(record.clockOut).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "---"}
        </span>
      ),
    },
    {
      header: "Hours",
      align: "right",
      cell: (record) => (
        <span className="font-bold">
          {record.hoursWorked?.toFixed(1) || "0.0"}h
        </span>
      ),
    },
  ];
}

interface EmployeeTaskColumnsOptions {
  canManageTaskStatus: boolean;
  onTaskStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function createEmployeeTaskColumns({
  canManageTaskStatus,
  onTaskStatusChange,
}: EmployeeTaskColumnsOptions): ColumnDef<OrderItemTask>[] {
  return [
    {
      header: "Order #",
      cell: (task) => (
        <span className="font-bold">{task.item?.order.orderNumber || "-"}</span>
      ),
    },
    {
      header: "Item/Step",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-medium">{task.item?.garmentTypeName || "-"}</span>
          <FieldLabel className="font-mono">{task.stepName}</FieldLabel>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (task) => (
        <Select
          value={task.status}
          onValueChange={(value) => {
            if (isTaskStatus(value)) {
              onTaskStatusChange(task.id, value);
            }
          }}
          disabled={!canManageTaskStatus}
        >
          <SelectTrigger className="h-7 w-[130px] text-xs font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs font-bold uppercase"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Rate",
      align: "right",
      cell: (task) => (
        <span className="font-bold text-primary">
          {formatPKR(
            getEffectiveTaskRate(
              task.rateSnapshot,
              task.rateOverride,
              task.designRateSnapshot,
            ),
          )}
        </span>
      ),
    },
    {
      header: "Last Update",
      align: "right",
      cell: (task) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(task.updatedAt)}
        </span>
      ),
    },
  ];
}

interface EmployeeLedgerColumnsOptions {
  canManageLedger: boolean;
  onReverseLedgerEntry: (entryId: string) => void;
}

export function createEmployeeLedgerColumns({
  canManageLedger,
  onReverseLedgerEntry,
}: EmployeeLedgerColumnsOptions): ColumnDef<EmployeeLedgerEntry>[] {
  return [
    {
      header: "Date",
      cell: (entry) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(entry.createdAt)}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (entry) => (
        <Badge variant={LEDGER_ENTRY_TYPE_BADGE[entry.type]} size="xs">
          {LEDGER_ENTRY_TYPE_LABELS[entry.type]}
        </Badge>
      ),
    },
    {
      header: "Amount",
      align: "right",
      cell: (entry) => (
        <span
          className={`text-sm font-bold ${entry.amount >= 0 ? "text-primary" : "text-destructive"}`}
        >
          {entry.amount >= 0 ? "+" : ""}
          {formatPKR(Math.abs(entry.amount))}
        </span>
      ),
    },
    {
      header: "Task / Note",
      cell: (entry) => (
        <div className="flex max-w-xs flex-col">
          {entry.orderItemTask ? (
            <span className="text-xs font-semibold">
              {entry.orderItemTask.stepName} -{" "}
              {entry.orderItemTask.orderItem?.garmentTypeName}
            </span>
          ) : null}
          {entry.note ? (
            <span className="text-xs text-muted-foreground">{entry.note}</span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Order #",
      cell: (entry) => (
        <span className="text-xs text-muted-foreground">
          {entry.orderItemTask?.orderItem?.order?.orderNumber ?? "-"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      cell: (entry) =>
        canManageLedger ? (
          <Button
            size="icon"
            className="h-7 w-7"
            onClick={() => onReverseLedgerEntry(entry.id)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];
}
