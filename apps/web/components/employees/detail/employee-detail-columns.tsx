"use client";

import { ChevronRight, RotateCcw } from "lucide-react";
import {
  type EmployeeLedgerEntry,
  type OrderItem,
  type OrderItemTask,
  type TaskStatus,
  isTaskStatus,
} from "@tbms/shared-types";
import {
  LEDGER_ENTRY_TYPE_BADGE,
  LEDGER_ENTRY_TYPE_LABELS,
  TASK_STATUS_OPTIONS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { FieldLabel } from "@tbms/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { formatDate, formatDateTime, formatPKR } from "@/lib/utils";

export function createEmployeeHistoryColumns(
  onViewOrder: (orderId: string) => void,
): ColumnDef<OrderItem>[] {
  return [
    {
      id: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.order?.orderNumber || "-"}</span>
      ),
    },
    {
      id: "garment",
      header: "Garment",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.garmentTypeName}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.completedAt
              ? `Completed: ${formatDate(row.original.completedAt)}`
              : "Pending"}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="scale-90">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-bold text-primary">
            {formatPKR(row.original.unitPrice)}
          </span>
        </div>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-right" />,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewOrder(row.original.orderId)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
      id: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-bold">
          {row.original.item?.order.orderNumber || "-"}
        </span>
      ),
    },
    {
      id: "itemStep",
      header: "Item/Step",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.item?.garmentTypeName || "-"}</span>
          <FieldLabel className="font-mono">{row.original.stepName}</FieldLabel>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) => {
            if (value && isTaskStatus(value)) {
              onTaskStatusChange(row.original.id, value);
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
      id: "rate",
      header: () => <div className="text-right">Rate</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-bold text-primary">
            {formatPKR(
              getEffectiveTaskRate(
                row.original.rateSnapshot,
                row.original.rateOverride,
                row.original.designRateSnapshot,
              ),
            )}
          </span>
        </div>
      ),
    },
    {
      id: "lastUpdate",
      header: () => <div className="text-right">Last Update</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span className="text-xs text-muted-foreground">
            {formatDateTime(row.original.updatedAt)}
          </span>
        </div>
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
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={LEDGER_ENTRY_TYPE_BADGE[row.original.type]}>
          {LEDGER_ENTRY_TYPE_LABELS[row.original.type]}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <span
            className={`text-sm font-bold ${row.original.amount >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {row.original.amount >= 0 ? "+" : ""}
            {formatPKR(Math.abs(row.original.amount))}
          </span>
        </div>
      ),
    },
    {
      id: "taskNote",
      header: "Task / Note",
      cell: ({ row }) => (
        <div className="flex max-w-xs flex-col">
          {row.original.orderItemTask ? (
            <span className="text-xs font-semibold">
              {row.original.orderItemTask.stepName} -{" "}
              {row.original.orderItemTask.orderItem?.garmentTypeName}
            </span>
          ) : null}
          {row.original.note ? (
            <span className="text-xs text-muted-foreground">{row.original.note}</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "order",
      header: "Order #",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.orderItemTask?.orderItem?.order?.orderNumber ?? "-"}
        </span>
      ),
    },
    {
      id: "action",
      header: () => <div className="text-right">Action</div>,
      cell: ({ row }) =>
        canManageLedger ? (
          <div className="text-right">
            <Button
              size="icon"
              className="h-7 w-7"
              onClick={() => onReverseLedgerEntry(row.original.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        ) : null,
    },
  ];
}
