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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        header: "Step",
        cell: (task) => (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{task.stepName}</span>
            <span className="font-mono text-xs uppercase text-muted-foreground">
              {task.stepKey}
            </span>
          </div>
        ),
      },
      {
        header: "Assigned Employee",
        cell: (task) => {
          const eligibleEmployees = eligibleEmployeesByTask[task.id] ?? [];
          const assignedEmployeeOption = task.assignedEmployeeId
            ? employees.find(
                (employee) => employee.id === task.assignedEmployeeId,
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
            loadingId !== task.id &&
            (hasSelectableEmployee || Boolean(task.assignedEmployeeId));

          return (
            <div className="min-w-[180px]">
              <Select
                disabled={!canModifyAssignment}
                value={task.assignedEmployeeId || "unassigned"}
                onValueChange={(value) => {
                  onAssign(task.id, value === "unassigned" ? null : value);
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
              {!hasSelectableEmployee && !task.assignedEmployeeId ? (
                <p className="mt-1 text-xs text-secondary-foreground">
                  No eligible employees for this step.
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        header: "Status",
        cell: (task) => (
          <div className="min-w-[140px]">
            <Select
              disabled={loadingId === task.id}
              value={task.status}
              onValueChange={(value) => {
                if (isTaskStatus(value)) {
                  onStatusChange(task.id, value);
                }
              }}
            >
              <SelectTrigger className="h-8 border-transparent bg-transparent p-0 text-muted-foreground shadow-none hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
                <Badge
                  variant={TASK_STATUS_CONFIG[task.status].variant}
                  className="w-full justify-center uppercase"
                >
                  {TASK_STATUS_CONFIG[task.status].label}
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
        header: "Labor Rate",
        align: "right",
        cell: (task) => {
          const effectiveRateInRupees =
            getEffectiveTaskRate(
              task.rateSnapshot,
              task.rateOverride,
              task.designRateSnapshot,
            ) / 100;
          const isEditing = editingRateId === task.id;

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
                        onRateUpdate(task.id);
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
                    onClick={() => onRateUpdate(task.id)}
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
                    task.rateOverride
                      ? "text-primary"
                      : task.designRateSnapshot
                        ? "text-primary/80"
                        : "text-foreground"
                  }`}
                >
                  {formatPKR(
                    getEffectiveTaskRate(
                      task.rateSnapshot,
                      task.rateOverride,
                      task.designRateSnapshot,
                    ),
                  )}
                </span>
                {task.rateOverride ? (
                  <span className="text-xs text-muted-foreground line-through">
                    Base: {formatPKR(task.rateSnapshot ?? 0)}
                  </span>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onStartRateEdit(task.id, effectiveRateInRupees)}
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
