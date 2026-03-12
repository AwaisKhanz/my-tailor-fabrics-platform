import { useCallback, useEffect, useMemo } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Clock3, History } from "lucide-react";
import { type Order } from "@tbms/shared-types";
import { ORDER_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@tbms/ui/components/card";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { EmptyState } from "@tbms/ui/components/empty-state";
import { Text } from "@tbms/ui/components/typography";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

interface CustomerOrdersTabProps {
  orders: Order[];
  onOpenOrder: (orderId: string) => void;
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
        accessorKey: "orderNumber",
        header: "Order #",
        cell: ({ row }) => (
          <Text
            as="p"
             variant="body"
            className="font-semibold text-primary"
          >
            {row.original.orderNumber}
          </Text>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
          </div>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
          <Text as="p"  variant="body" className="font-semibold">
            {formatPKR(row.original.totalAmount)}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const statusConfig = ORDER_STATUS_CONFIG[row.original.status];

          return (
            <Badge
              variant={statusConfig.variant}

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

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );
  const onPaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const next = resolveUpdater(updater, pagination);
      setPage(next.pageIndex + 1);
    },
    [pagination, setPage],
  );
  const sorting = useMemo<SortingState>(() => [], []);
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      void updater;
    },
    [],
  );

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle>Order History</CardTitle>
            <Badge variant="default" className="font-semibold">
              {orders.length} ORDERS
            </Badge>
          </div>
          <Text as="p"  variant="muted">
            Review all customer orders with current status and amount details.
          </Text>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {total === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={History}
              title="No order history"
              description="This customer has not placed any orders yet."
            />
          </div>
        ) : (
          <DataTableTanstack
            columns={columns}
            data={pagedOrders}
            itemLabel="orders"
            emptyMessage="No orders found."
            chrome="flat"
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={Math.max(1, Math.ceil(total / pageSize))}
            totalCount={total}
            manualPagination
            sorting={sorting}
            onSortingChange={onSortingChange}
            onRowClick={(row) => onOpenOrder(row.original.id)}
          />
        )}
      </CardContent>
    </Card>
  );
}
