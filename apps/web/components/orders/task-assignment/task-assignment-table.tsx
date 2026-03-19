"use client";

import { useCallback, useMemo } from "react";
import {
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { type Employee, type OrderItemTask, TaskStatus } from "@tbms/shared-types";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { TableSurface } from "@tbms/ui/components/table-layout";
import { useTaskAssignmentTable } from "@/hooks/use-task-assignment-table";
import { resolveUpdater } from "@/lib/tanstack";

interface TaskAssignmentTableProps {
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

export function TaskAssignmentTable({
  tasks,
  employees,
  eligibleEmployeesByTask,
  loadingId,
  onAssign,
  onStatusChange,
}: TaskAssignmentTableProps) {
  const { columns, pagedTasks, page, pageSize, total, setPage } =
    useTaskAssignmentTable({
      tasks,
      employees,
      eligibleEmployeesByTask,
      loadingId,
      onAssign,
      onStatusChange,
    });

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = resolveUpdater(updater, pagination);
      setPage(next.pageIndex + 1);
    },
    [pagination, setPage],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      void updater;
    },
    [],
  );

  return (
    <TableSurface shadow="none">
      <DataTableTanstack
        columns={columns}
        data={pagedTasks}
        loading={false}
        itemLabel="tasks"
        emptyMessage="No tasks found. Was the workflow enabled when this order was placed?"
        chrome="flat"
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={Math.max(1, Math.ceil(total / pageSize))}
        totalCount={total}
        manualPagination
        sorting={sorting}
        onSortingChange={onSortingChange}
      />
    </TableSurface>
  );
}
