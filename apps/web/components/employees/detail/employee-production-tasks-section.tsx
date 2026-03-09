"use client";

import type { OrderItemTask } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";

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
  return (
    <EmployeeSection
      id="employee-production"
      title="Production Tasks"
      description="Update assigned task statuses for this employee."
      badge={
        <Badge variant="default" size="xs" className="font-semibold">
          {tasks.length} TASKS
        </Badge>
      }
      defaultOpen
    >
      <DataTable
        columns={columns}
        data={tasks}
        loading={loading}
        emptyMessage="No assigned tasks found."
        chrome="flat"
        page={page}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </EmployeeSection>
  );
}
