"use client";

import type { OrderItem } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";

interface EmployeeWorkHistorySectionProps {
  items: OrderItem[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  columns: ColumnDef<OrderItem>[];
  onPageChange: (page: number) => void;
}

export function EmployeeWorkHistorySection({
  items,
  loading,
  page,
  total,
  limit,
  columns,
  onPageChange,
}: EmployeeWorkHistorySectionProps) {
  return (
    <EmployeeSection
      id="employee-history"
      title="Work History"
      description="Review completed and pending order items handled by this employee."
      badge={
        <Badge variant="default" className="font-semibold">
          {items.length} ITEMS
        </Badge>
      }
      defaultOpen
    >
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No work items found."
        chrome="flat"
        page={page}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </EmployeeSection>
  );
}
