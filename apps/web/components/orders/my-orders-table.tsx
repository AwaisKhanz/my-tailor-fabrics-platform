import { useMemo } from "react";
import { ITEM_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatDate, formatPKR } from "@/lib/utils";
import { type MyAssignedWorkItem } from "@/hooks/use-my-orders-page";

interface MyOrdersTableProps {
  items: MyAssignedWorkItem[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function MyOrdersTable({
  items,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
}: MyOrdersTableProps) {
  const columns = useMemo<ColumnDef<MyAssignedWorkItem>[]>(
    () => [
      {
        header: "Order #",
        cell: (item) => (
          <span className="font-bold text-primary">
            {item.order.orderNumber}
          </span>
        ),
      },
      {
        header: "Garment Type",
        cell: (item) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {item.garmentTypeName}
            </span>
            <FieldLabel className="mt-0.5">
              {item.description || "—"}
            </FieldLabel>
          </div>
        ),
      },
      {
        header: "Due Date",
        cell: (item) => {
          const dueDate = item.dueDate ?? item.order.dueDate ?? "";
          return <FieldLabel>{formatDate(dueDate)}</FieldLabel>;
        },
      },
      {
        header: "Status",
        cell: (item) => {
          const status = item.status;
          return (
            <Badge variant={ITEM_STATUS_CONFIG[status].variant}>
              {ITEM_STATUS_CONFIG[status].label}
            </Badge>
          );
        },
      },
      {
        header: "Price",
        align: "right",
        cell: (item) => (
          <span className="whitespace-nowrap text-sm font-semibold text-primary">
            {formatPKR(item.unitPrice)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      itemLabel="items"
      emptyMessage="You don't have any orders assigned to you at the moment."
      chrome="flat"
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
    />
  );
}
