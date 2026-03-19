"use client";

import { useCallback, useMemo } from "react";
import type { OrderItemTask } from "@tbms/shared-types";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@tbms/ui/components/badge";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";
import { resolveUpdater } from "@/lib/tanstack";

interface EmployeeProductionTasksSectionProps {
  tasks: OrderItemTask[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  columns: ColumnDef<OrderItemTask>[];
  onPageChange: (page: number) => void;
}

export function EmployeeProductionTasksSection({
  tasks,
  loading,
  page,
  total,
  limit,
  columns,
  onPageChange,
}: EmployeeProductionTasksSectionProps) {
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize: limit,
    }),
    [limit, page],
  );
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      void updater;
    },
    [],
  );

  return (
    <EmployeeSection
      id="employee-production"
      title="Production Tasks"
      description="Update assigned task statuses for this employee."
      badge={
        <Badge variant="default" className="font-semibold">
          {total} TASKS
        </Badge>
      }
      defaultOpen
      collapsible={false}
    >
      <DataTableTanstack
        columns={columns}
        data={tasks}
        loading={loading}
        emptyMessage="No assigned tasks found."
        chrome="flat"
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={Math.max(1, Math.ceil(total / limit))}
        totalCount={total}
        manualPagination
        sorting={sorting}
        onSortingChange={onSortingChange}
      />
    </EmployeeSection>
  );
}
