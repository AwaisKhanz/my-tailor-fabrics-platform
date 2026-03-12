"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Check, Edit2, X } from "lucide-react";
import {
  type Employee,
  isTaskStatus,
  type OrderItemTask,
  TaskStatus,
} from "@tbms/shared-types";
import {
  TASK_STATUS_CONFIG,
  TASK_STATUS_OPTIONS,
  getEffectiveTaskRate,
} from "@tbms/shared-constants";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { Input } from "@tbms/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { formatPKR } from "@/lib/utils";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

interface UseTaskAssignmentTableParams {
  tasks: OrderItemTask[];
  employees: Array<Pick<Employee, "id" | "fullName">>;
  eligibleEmployeesByTask: Record<
    string,
    Array<Pick<Employee, "id" | "fullName">>
  >;
  loadingId: string | null;
  editingRateId: string | null;
  tempRate: string;
  rateValidationError: string;
  onTempRateChange: (value: string) => void;
  onAssign: (taskId: string, employeeId: string | null) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onStartRateEdit: (taskId: string, currentRateInRupees: number) => void;
  onCancelRateEdit: () => void;
  onRateUpdate: (taskId: string) => void;
}

export function useTaskAssignmentTable({
  tasks,
  employees,
  eligibleEmployeesByTask,
  loadingId,
  editingRateId,
  tempRate,
  rateValidationError,
  onTempRateChange,
  onAssign,
  onStatusChange,
  onStartRateEdit,
  onCancelRateEdit,
  onRateUpdate,
}: UseTaskAssignmentTableParams) {
  const { setValues, getPositiveInt } = useUrlTableState({
    prefix: "tasks",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const total = tasks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tasks.slice(start, start + pageSize);
  }, [tasks, page, pageSize]);

  const columns = useMemo<ColumnDef<OrderItemTask>[]>(
    () => [
      {
        id: "step",
        header: "Step",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.original.stepName}</span>
            <span className="font-mono text-xs uppercase text-muted-foreground">
              {row.original.stepKey}
            </span>
          </div>
        ),
      },
      {
        id: "assignedEmployee",
        header: "Assigned Employee",
        cell: ({ row }) => {
          const eligibleEmployees = eligibleEmployeesByTask[row.original.id] ?? [];
          const assignedEmployeeOption = row.original.assignedEmployeeId
            ? employees.find(
                (employee) => employee.id === row.original.assignedEmployeeId,
              )
            : undefined;
          const assignmentOptions = assignedEmployeeOption
            ? [
                ...eligibleEmployees,
                ...(eligibleEmployees.some(
                  (employee) => employee.id === assignedEmployeeOption.id,
                )
                  ? []
                  : [assignedEmployeeOption]),
              ]
            : eligibleEmployees;
          const hasSelectableEmployee = assignmentOptions.length > 0;
          const canModifyAssignment =
            loadingId !== row.original.id &&
            (hasSelectableEmployee || Boolean(row.original.assignedEmployeeId));

          return (
            <div className="min-w-[180px]">
              <Select
                disabled={!canModifyAssignment}
                value={row.original.assignedEmployeeId || "unassigned"}
                onValueChange={(value) => {
                  onAssign(row.original.id, value === "unassigned" ? null : value);
                }}
              >
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue placeholder="Assign Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assignmentOptions.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!hasSelectableEmployee && !row.original.assignedEmployeeId ? (
                <p className="mt-1 text-xs text-secondary-foreground">
                  No eligible employees for this step.
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <Select
              disabled={loadingId === row.original.id}
              value={row.original.status}
              onValueChange={(value) => {
                if (value && isTaskStatus(value)) {
                  onStatusChange(row.original.id, value);
                }
              }}
            >
              <SelectTrigger className="h-8 border-transparent bg-transparent p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
                <Badge
                  variant={TASK_STATUS_CONFIG[row.original.status].variant}
                  className="w-full justify-center uppercase"
                >
                  {TASK_STATUS_CONFIG[row.original.status].label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      },
      {
        id: "rate",
        header: () => <div className="text-right">Labor Rate</div>,
        cell: ({ row }) => {
          const effectiveRateInRupees =
            getEffectiveTaskRate(
              row.original.rateSnapshot,
              row.original.rateOverride,
              row.original.designRateSnapshot,
            ) / 100;
          const isEditing = editingRateId === row.original.id;

          if (isEditing) {
            return (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center justify-end gap-1">
                  <Input
                    className="h-7 w-20 text-right text-xs"
                    type="number"
                    value={tempRate}
                    onChange={(event) => onTempRateChange(event.target.value)}
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        onRateUpdate(row.original.id);
                      }
                      if (event.key === "Escape") {
                        onCancelRateEdit();
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRateUpdate(row.original.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-7 w-7"
                    onClick={onCancelRateEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {rateValidationError ? (
                  <p className="text-xs text-destructive">
                    {rateValidationError}
                  </p>
                ) : null}
              </div>
            );
          }

          return (
            <div className="group flex items-center justify-end gap-2">
              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    row.original.rateOverride
                      ? "text-primary"
                      : row.original.designRateSnapshot
                        ? "text-primary/80"
                        : "text-foreground"
                  }`}
                >
                  {formatPKR(
                    getEffectiveTaskRate(
                      row.original.rateSnapshot,
                      row.original.rateOverride,
                      row.original.designRateSnapshot,
                    ),
                  )}
                </span>
                {row.original.rateOverride ? (
                  <span className="text-xs text-muted-foreground line-through">
                    Base: {formatPKR(row.original.rateSnapshot ?? 0)}
                  </span>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() =>
                  onStartRateEdit(row.original.id, effectiveRateInRupees)
                }
              >
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editingRateId,
      employees,
      eligibleEmployeesByTask,
      loadingId,
      onAssign,
      onCancelRateEdit,
      onRateUpdate,
      onStartRateEdit,
      onStatusChange,
      onTempRateChange,
      rateValidationError,
      tempRate,
    ],
  );

  return {
    columns,
    pagedTasks,
    page,
    pageSize,
    total,
    setPage,
  };
}
