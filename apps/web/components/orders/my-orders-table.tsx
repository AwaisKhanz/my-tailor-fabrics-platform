import { useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ITEM_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatDate, formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";
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
        id: "orderNumber",
        accessorFn: (item) => item.order.orderNumber,
        header: "Order #",
        cell: ({ row }) => (
          <span className="font-bold text-primary">
            {row.original.order.orderNumber}
          </span>
        ),
      },
      {
        accessorKey: "garmentTypeName",
        header: "Garment Type",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {row.original.garmentTypeName}
            </span>
            <FieldLabel className="mt-0.5">
              {row.original.description || "—"}
            </FieldLabel>
          </div>
        ),
      },
      {
        id: "dueDate",
        accessorFn: (item) => item.dueDate ?? item.order.dueDate ?? "",
        header: "Due Date",
        cell: ({ row }) => {
          const dueDate = row.original.dueDate ?? row.original.order.dueDate ?? "";
          return <FieldLabel>{formatDate(dueDate)}</FieldLabel>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={ITEM_STATUS_CONFIG[status].variant}>
              {ITEM_STATUS_CONFIG[status].label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Price",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-semibold text-primary">
            {formatPKR(row.original.unitPrice)}
          </span>
        ),
      },
    ],
    [],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useMemo<OnChangeFn<PaginationState>>(
    () => (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useMemo<OnChangeFn<SortingState>>(
    () => () => {
      return;
    },
    [],
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={items}
      loading={loading}
      itemLabel="items"
      emptyMessage="You don't have any orders assigned to you at the moment."
      chrome="flat"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
