import { useMemo } from "react";
import { ItemStatus } from "@tbms/shared-types";
import { ITEM_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
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

function parseItemStatus(value: string): ItemStatus {
  switch (value) {
    case ItemStatus.PENDING:
    case ItemStatus.IN_PROGRESS:
    case ItemStatus.COMPLETED:
    case ItemStatus.CANCELLED:
      return value;
    default:
      return ItemStatus.PENDING;
  }
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
            <Label className="text-sm font-bold uppercase  text-muted-foreground mt-0.5">
              {item.description || "—"}
            </Label>
          </div>
        ),
      },
      {
        header: "Due Date",
        cell: (item) => {
          const dueDate = item.dueDate ?? item.order.dueDate ?? "";
          return (
            <Label className="text-sm font-bold uppercase  text-muted-foreground">
              {formatDate(dueDate)}
            </Label>
          );
        },
      },
      {
        header: "Status",
        cell: (item) => {
          const status = parseItemStatus(item.status);
          return (
            <Badge variant={ITEM_STATUS_CONFIG[status].variant} size="xs">
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
