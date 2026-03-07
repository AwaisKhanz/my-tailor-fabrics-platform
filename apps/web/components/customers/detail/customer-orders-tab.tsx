import { useCallback, useEffect, useMemo } from "react";
import { Clock3, History } from "lucide-react";
import { type Order, OrderStatus } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/typography";
import { formatPKR } from "@/lib/utils";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

interface CustomerOrdersTabProps {
  orders: Order[];
  onOpenOrder: (orderId: string) => void;
}

function parseOrderStatus(value: string): OrderStatus {
  switch (value) {
    case OrderStatus.NEW:
    case OrderStatus.IN_PROGRESS:
    case OrderStatus.READY:
    case OrderStatus.OVERDUE:
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
    case OrderStatus.CANCELLED:
      return value;
    default:
      return OrderStatus.NEW;
  }
}

export function CustomerOrdersTab({
  orders,
  onOpenOrder,
}: CustomerOrdersTabProps) {
  const { setValues, getPositiveInt } = useUrlTableState({
    prefix: "customerOrders",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
    },
  });
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return orders.slice(start, start + pageSize);
  }, [orders, page, pageSize]);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        header: "Order #",
        cell: (order) => (
          <Text
            as="p"
             variant="body"
            className="font-semibold text-primary"
          >
            {order.orderNumber}
          </Text>
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
          <Text as="p"  variant="body" className="font-semibold">
            {formatPKR(order.totalAmount)}
          </Text>
        ),
      },
      {
        header: "Status",
        align: "right",
        cell: (order) => {
          const statusConfig = ORDER_STATUS_CONFIG[parseOrderStatus(order.status)];

          return (
            <Badge
              variant={statusConfig.variant}
              size="xs"
              className="font-bold"
            >
              {statusConfig.label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader layout="rowBetweenResponsive" surface="mutedSection" trimBottom>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>Order History</CardTitle>
            <Badge variant="default" size="xs" className="font-semibold">
              {orders.length} ORDERS
            </Badge>
          </div>
          <Text as="p"  variant="muted">
            Review all customer orders with current status and amount details.
          </Text>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="p-0">
        {total === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={History}
              title="No order history"
              description="This customer has not placed any orders yet."
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={pagedOrders}
            itemLabel="orders"
            emptyMessage="No orders found."
            onRowClick={(order) => onOpenOrder(order.id)}
            chrome="flat"
            page={page}
            total={total}
            limit={pageSize}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
