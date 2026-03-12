import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Eye, History, Pencil, Printer } from "lucide-react";
import { Order, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { useOrderReceiptPdf } from "@/hooks/queries/order-queries";
import type { OrdersSortField } from "@/hooks/use-orders-list-page";
import { buildOrderProgressSteps } from "@/lib/order-progress-steps";
import { resolveUpdater } from "@/lib/tanstack";
import { formatPKR } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@tbms/ui/components/avatar";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableColumnHeader } from "@tbms/ui/components/data-table-column-header";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { ProgressSteps } from "@tbms/ui/components/progress-steps";

function isOrdersSortField(value: string): value is OrdersSortField {
  return (
    value === "orderNumber" ||
    value === "orderDate" ||
    value === "dueDate" ||
    value === "totalAmount" ||
    value === "status" ||
    value === "customer"
  );
}

interface OrdersListTableProps {
  orders: Order[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  sortBy: OrdersSortField;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: OrdersSortField, sortOrder: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onViewOrder: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
  canEditOrder?: boolean;
  canPrintReceipt?: boolean;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "CU";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function OrdersListTable({
  orders,
  loading,
  page,
  total,
  limit,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onViewOrder,
  onEditOrder,
  canEditOrder = true,
  canPrintReceipt = true,
}: OrdersListTableProps) {
  const orderReceiptPdfMutation = useOrderReceiptPdf();
  const handlePrintReceipt = useCallback(
    async (orderId: string) => {
      try {
        const receiptBlob = await orderReceiptPdfMutation.mutateAsync(orderId);
        const receiptUrl = window.URL.createObjectURL(receiptBlob);
        window.open(receiptUrl, "_blank", "noopener,noreferrer");
        window.setTimeout(() => {
          window.URL.revokeObjectURL(receiptUrl);
        }, 60_000);
      } catch {
        toast({
          title: "Error",
          description: "Failed to generate receipt",
          variant: "destructive",
        });
      }
    },
    [orderReceiptPdfMutation],
  );

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order ID" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            className="cursor-pointer text-sm font-bold text-primary hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onViewOrder(row.original.id);
            }}
          >
            {row.original.orderNumber}
          </button>
        ),
      },
      {
        id: "customer",
        accessorFn: (order) => order.customer.fullName,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {getInitials(row.original.customer.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight text-foreground">
                {row.original.customer.fullName}
              </span>
              <FieldLabel className="mt-0.5">
                {row.original.customer.phone}
              </FieldLabel>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "orderDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order Date" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatShortDate(row.original.orderDate)}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: ({ row }) => {
          const isOverdue = row.original.status === OrderStatus.OVERDUE;
          const isCompleted =
            row.original.status === OrderStatus.DELIVERED ||
            row.original.status === OrderStatus.COMPLETED;

          return (
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`whitespace-nowrap text-sm font-medium ${isOverdue ? "font-bold text-destructive" : "text-muted-foreground"}`}
              >
                {formatShortDate(row.original.dueDate)}
              </span>
              <FieldLabel
                tone={
                  isOverdue
                    ? "destructive"
                    : isCompleted
                      ? "primary"
                      : "default"
                }
              >
                {isOverdue ? "Overdue" : isCompleted ? "Closed" : "Scheduled"}
              </FieldLabel>
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              column={column}
              title="Total Amount"
              className="ml-auto"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right text-sm font-semibold text-foreground">
            {formatPKR(row.original.totalAmount)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const statusConfig = ORDER_STATUS_CONFIG[row.original.status];
          return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const order = row.original;
          const isReady = order.status === OrderStatus.READY;
          const isDelivered =
            order.status === OrderStatus.DELIVERED ||
            order.status === OrderStatus.COMPLETED;

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewOrder(order.id);
                }}
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {!isDelivered && canEditOrder ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditOrder(order.id);
                  }}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}

              {isReady && canPrintReceipt ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    void handlePrintReceipt(order.id);
                  }}
                  title="Print Receipt"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              ) : null}

              {isDelivered ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewOrder(order.id);
                  }}
                  title="View History"
                >
                  <History className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      canEditOrder,
      canPrintReceipt,
      handlePrintReceipt,
      onEditOrder,
      onViewOrder,
    ],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize: limit,
    }),
    [limit, page],
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: sortBy,
        desc: sortOrder === "desc",
      },
    ],
    [sortBy, sortOrder],
  );

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = resolveUpdater(updater, sorting);
      const firstSort = next[0];

      if (!firstSort) {
        onSortChange("orderDate", "desc");
        return;
      }

      if (!isOrdersSortField(firstSort.id)) {
        return;
      }

      onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
    },
    [onSortChange, sorting],
  );

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <DataTableTanstack
      columns={columns}
      data={orders}
      loading={loading}
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      manualSorting
      itemLabel="orders"
      emptyMessage="No orders found matching your criteria."
      renderExpandedRow={(row) => {
        const order = row.original;
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Workflow Progress
              </p>
              <Badge variant={ORDER_STATUS_CONFIG[order.status].variant}>
                {ORDER_STATUS_CONFIG[order.status].label}
              </Badge>
            </div>
            <ProgressSteps
              data={{ steps: buildOrderProgressSteps(order.status) }}
              className="rounded-xl border border-border bg-background p-3"
            />
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <p>
                Created:{" "}
                <span className="font-medium text-foreground">
                  {formatShortDate(order.createdAt)}
                </span>
              </p>
              <p>
                Due:{" "}
                <span className="font-medium text-foreground">
                  {formatShortDate(order.dueDate)}
                </span>
              </p>
              <p>
                Balance:{" "}
                <span className="font-medium text-foreground">
                  {formatPKR(order.balanceDue)}
                </span>
              </p>
            </div>
          </div>
        );
      }}
      getRowId={(order) => order.id}
    />
  );
}
