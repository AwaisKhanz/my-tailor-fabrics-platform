"use client";

import { useCallback, useEffect, useMemo } from "react";
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
  onAssign: (taskId: string, employeeId: string | null) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function useTaskAssignmentTable({
  tasks,
  employees,
  eligibleEmployeesByTask,
  loadingId,
  onAssign,
  onStatusChange,
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

  const taskSequenceMetaById = useMemo(() => {
    let blockingStepName: string | null = null;

    return tasks.reduce<
      Record<
        string,
        {
          stepNumber: number;
          blockedByStepName: string | null;
        }
      >
    >((acc, task, index) => {
      acc[task.id] = {
        stepNumber: index + 1,
        blockedByStepName: blockingStepName,
      };

      const unlocksNext =
        task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED;

      if (!unlocksNext && blockingStepName === null) {
        blockingStepName = task.stepName;
      } else if (blockingStepName === task.stepName && unlocksNext) {
        blockingStepName = null;
      }

      return acc;
    }, {});
  }, [tasks]);

  const columns = useMemo<ColumnDef<OrderItemTask>[]>(
    () => [
      {
        id: "step",
        header: "Step",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Step{" "}
              {taskSequenceMetaById[row.original.id]?.stepNumber ??
                row.index + 1}
            </span>
            <span className="font-bold text-foreground">
              {row.original.stepName}
            </span>
            <span className="text-xs text-muted-foreground">
              {taskSequenceMetaById[row.original.id]?.blockedByStepName
                ? `Unlocks after ${taskSequenceMetaById[row.original.id]?.blockedByStepName}`
                : "Ready for this piece"}
            </span>
          </div>
        ),
      },
      {
        id: "assignedEmployee",
        header: "Assigned Employee",
        cell: ({ row }) => {
          const taskMeta = taskSequenceMetaById[row.original.id];
          const eligibleEmployees =
            eligibleEmployeesByTask[row.original.id] ?? [];
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
                  onAssign(
                    row.original.id,
                    value === "unassigned" ? null : value,
                  );
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
              ) : taskMeta?.blockedByStepName ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Planning is allowed, but this step stays locked until{" "}
                  {taskMeta.blockedByStepName} is finished.
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const taskMeta = taskSequenceMetaById[row.original.id];
          const sequenceLockedReason = taskMeta?.blockedByStepName
            ? `Complete ${taskMeta.blockedByStepName} first.`
            : null;
          const assignmentLockedReason =
            !row.original.assignedEmployeeId &&
            row.original.status !== TaskStatus.CANCELLED
              ? "Assign an employee before starting this step."
              : null;
          const statusLockedReason =
            sequenceLockedReason ?? assignmentLockedReason;

          return (
            <div className=" ">
              <Select
                disabled={loadingId === row.original.id}
                value={row.original.status}
                onValueChange={(value) => {
                  if (value && isTaskStatus(value)) {
                    onStatusChange(row.original.id, value);
                  }
                }}
              >
                <SelectTrigger className="h-8 border-transparent !bg-transparent p-0 text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-100">
                  <Badge
                    variant={TASK_STATUS_CONFIG[row.original.status].variant}
                    className="w-full justify-center uppercase"
                  >
                    {TASK_STATUS_CONFIG[row.original.status].label}
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={
                        (option.value === TaskStatus.IN_PROGRESS ||
                          option.value === TaskStatus.DONE) &&
                        Boolean(statusLockedReason)
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusLockedReason ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {statusLockedReason}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Move this step forward only when work really starts or
                  finishes.
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "rate",
        header: () => <div className="text-right">Fixed Labor Rate</div>,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end gap-2">
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
                {row.original.designRateSnapshot ? (
                  <span className="text-xs text-muted-foreground">
                    Includes design rate
                  </span>
                ) : row.original.rateSnapshot ? (
                  <span className="text-xs text-muted-foreground">
                    Auto from labor setup
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },
    ],
    [
      employees,
      eligibleEmployeesByTask,
      loadingId,
      onAssign,
      onStatusChange,
      taskSequenceMetaById,
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
