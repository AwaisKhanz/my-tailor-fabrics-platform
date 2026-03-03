import { useMemo } from "react";
import { Clock3, History } from "lucide-react";
import { type Order, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSurface } from "@/components/ui/table-layout";
import { Typography } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";

interface CustomerOrdersTabProps {
  orders: Order[];
  onOpenOrder: (orderId: string) => void;
}

export function CustomerOrdersTab({ orders, onOpenOrder }: CustomerOrdersTabProps) {
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Order #",
        cell: (order) => (
          <Typography as="p" variant="body" className="font-semibold text-primary">
            {order.orderNumber}
          </Typography>
        ),
      },
      {
        header: "Created",
        cell: (order) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        ),
      },
      {
        header: "Total",
        align: "right",
        cell: (order) => (
          <Typography as="p" variant="body" className="font-semibold">
            {formatPKR(order.totalAmount)}
          </Typography>
        ),
      },
      {
        header: "Status",
        align: "right",
        cell: (order) => {
          const statusConfig =
            ORDER_STATUS_CONFIG[order.status as OrderStatus] ??
            ORDER_STATUS_CONFIG[OrderStatus.NEW];

          return (
            <Badge variant={statusConfig.variant} size="xs" className="font-bold">
              {statusConfig.label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  if (orders.length === 0) {
    return (
      <div className="pt-4">
        <EmptyState
          icon={History}
          title="No order history"
          description="This customer has not placed any orders yet."
        />
      </div>
    );
  }

  return (
    <div className="pt-4">
      <TableSurface>
        <DataTable
          columns={columns}
          data={orders}
          itemLabel="orders"
          emptyMessage="No orders found."
          onRowClick={(order) => onOpenOrder(order.id)}
          chrome="flat"
        />
      </TableSurface>
    </div>
  );
}
