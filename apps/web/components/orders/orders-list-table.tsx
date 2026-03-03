import { useCallback, useMemo } from "react";
import { Eye, History, Pencil, Printer } from "lucide-react";
import { Order, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { ordersApi } from "@/lib/api/orders";
import { formatPKR } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";

interface OrdersListTableProps {
  orders: Order[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onViewOrder: (orderId: string) => void;
  onEditOrder: (orderId: string) => void;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrdersListTable({
  orders,
  loading,
  page,
  total,
  limit,
  onPageChange,
  onViewOrder,
  onEditOrder,
}: OrdersListTableProps) {
  const handlePrintReceipt = useCallback(async (orderId: string) => {
    try {
      const receiptBlob = await ordersApi.getReceiptPdf(orderId);
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
  }, []);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Order ID",
        cell: (order) => (
          <button
            type="button"
            className="cursor-pointer text-sm font-bold text-primary hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onViewOrder(order.id);
            }}
          >
            {order.orderNumber}
          </button>
        ),
      },
      {
        header: "Customer",
        cell: (order) => (
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">
              {order.customer.fullName}
            </span>
            <Label variant="dashboard" className="mt-0.5">
              {order.customer.phone}
            </Label>
          </div>
        ),
      },
      {
        header: "Order Date",
        cell: (order) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatShortDate(order.createdAt)}
          </span>
        ),
      },
      {
        header: "Due Date",
        cell: (order) => {
          const isOverdue = order.status === OrderStatus.OVERDUE;
          return (
            <span
              className={`whitespace-nowrap text-sm font-medium ${isOverdue ? "font-bold text-destructive" : "text-muted-foreground"}`}
            >
              {formatShortDate(order.dueDate)}
            </span>
          );
        },
      },
      {
        header: "Total Amount",
        cell: (order) => (
          <span className="whitespace-nowrap text-sm font-semibold text-foreground">
            {formatPKR(order.totalAmount)}
          </span>
        ),
      },
      {
        header: "Status",
        cell: (order) => {
          const statusConfig =
            ORDER_STATUS_CONFIG[order.status as OrderStatus] ??
            ORDER_STATUS_CONFIG[OrderStatus.NEW];
          return (
            <Badge variant={statusConfig.variant} size="xs" className="px-2">
              {statusConfig.label}
            </Badge>
          );
        },
      },
      {
        header: "Actions",
        align: "right",
        cell: (order) => {
          const isReady = order.status === OrderStatus.READY;
          const isDelivered =
            order.status === OrderStatus.DELIVERED ||
            order.status === OrderStatus.COMPLETED;

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="tableIcon"
                size="iconSm"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewOrder(order.id);
                }}
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {!isDelivered ? (
                <Button
                  type="button"
                  variant="tableIcon"
                  size="iconSm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditOrder(order.id);
                  }}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}

              {isReady ? (
                <Button
                  type="button"
                  variant="tableIcon"
                  size="iconSm"
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
                  variant="tableIcon"
                  size="iconSm"
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
    [handlePrintReceipt, onEditOrder, onViewOrder],
  );

  return (
    <DataTable
      columns={columns}
      data={orders}
      loading={loading}
      page={page}
      total={total}
      limit={limit}
      onPageChange={onPageChange}
      itemLabel="orders"
      emptyMessage="No orders found matching your criteria."
      chrome="flat"
      onRowClick={(order) => onViewOrder(order.id)}
    />
  );
}
