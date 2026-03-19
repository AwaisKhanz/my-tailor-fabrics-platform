import { useCallback, useEffect, useMemo } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { CalendarDays, Scissors } from "lucide-react";
import { FabricSource, ItemStatus, OrderItem } from "@tbms/shared-types";
import { ITEM_STATUS_CONFIG } from "@tbms/shared-constants";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";
import { useUrlTableState } from "@/hooks/use-url-table-state";

interface OrderItemsTableProps {
  items: OrderItem[];
  onManageTasks: (item: OrderItem) => void;
  canManageTasks?: boolean;
  className?: string;
}

const PAGE_SIZE = 8;

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function OrderItemsTable({
  items,
  onManageTasks,
  canManageTasks = true,
  className,
}: OrderItemsTableProps) {
  const { setValues, getPositiveInt } = useUrlTableState({
    prefix: "items",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const summary = useMemo(() => {
    const completed = items.filter(
      (item) => item.status === ItemStatus.COMPLETED,
    ).length;
    const inProgress = items.filter(
      (item) => item.status === ItemStatus.IN_PROGRESS,
    ).length;
    return {
      total: items.length,
      completed,
      inProgress,
    };
  }, [items]);

  const columns = useMemo<ColumnDef<OrderItem>[]>(
    () => [
      {
        id: "piece",
        header: "Piece",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            #{row.original.pieceNo}
          </span>
        ),
      },
      {
        id: "item",
        header: "Item",
        cell: ({ row }) => (
          <div className="flex min-w-[180px] items-start gap-2">
            <Scissors className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {row.original.garmentTypeName}
              </p>
              {row.original.designType ? (
                <FieldLabel className="mt-0.5" tone="primary">
                  {row.original.designType.name}
                </FieldLabel>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: "workflow",
        header: "Workflow",
        cell: ({ row }) => {
          if (row.original.tasks && row.original.tasks.length > 0 && canManageTasks) {
            return (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => onManageTasks(row.original)}
              >
                Manage Tasks
              </Button>
            );
          }

          return (
            <span className="text-xs font-medium text-muted-foreground">
              {row.original.tasks && row.original.tasks.length > 0
                ? "No permission to manage"
                : "No workflow steps"}
            </span>
          );
        },
      },
      {
        id: "fabric",
        header: "Fabric",
        cell: ({ row }) => {
          const fabricName =
            row.original.shopFabricNameSnapshot ??
            row.original.shopFabric?.name ??
            "Shop Fabric";

          if (row.original.fabricSource === FabricSource.SHOP) {
            return (
              <div className="min-w-[180px] space-y-1">
                <Badge variant="secondary">Shop Fabric</Badge>
                <p className="text-sm font-semibold text-foreground">
                  {fabricName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {row.original.shopFabricTotalSnapshot
                    ? `Charge ${formatPKR(row.original.shopFabricTotalSnapshot)}`
                    : "Catalog price will apply"}
                </p>
              </div>
            );
          }

          return (
            <div className="min-w-[180px] space-y-1">
              <Badge variant="outline">Customer Fabric</Badge>
              <p className="text-xs text-muted-foreground">
                {row.original.customerFabricNote?.trim() ||
                  "Customer supplied fabric for this piece."}
              </p>
            </div>
          );
        },
      },
      {
        id: "due",
        header: "Due",
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            {row.original.dueDate ? formatShortDate(row.original.dueDate) : "-"}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={ITEM_STATUS_CONFIG[row.original.status].variant}
            className="uppercase"
          >
            {ITEM_STATUS_CONFIG[row.original.status].label}
          </Badge>
        ),
      },
      {
        id: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
          const addonsTotal = (row.original.addons || []).reduce(
            (total, addon) => total + addon.price,
            0,
          );
          const designPrice = row.original.designType?.defaultPrice || 0;
          const tailoringTotal = row.original.unitPrice * row.original.quantity;
          const designTotal = designPrice * row.original.quantity;
          const shopFabricTotal = row.original.shopFabricTotalSnapshot || 0;
          const totalAmount =
            tailoringTotal + designTotal + addonsTotal + shopFabricTotal;

          return (
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {formatPKR(totalAmount)}
              </p>
              {addonsTotal > 0 || designPrice > 0 || shopFabricTotal > 0 ? (
                <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>Tailoring: {formatPKR(tailoringTotal)}</p>
                  {row.original.designType ? (
                    <p>
                      Design: {row.original.designType.name} (
                      +{formatPKR(designTotal)})
                    </p>
                  ) : null}
                  {(row.original.addons || []).map((addon) => (
                    <p key={addon.id}>
                      {addon.name} (+{formatPKR(addon.price)})
                    </p>
                  ))}
                  {shopFabricTotal > 0 ? (
                    <p>
                      Shop Fabric: +{formatPKR(shopFabricTotal)}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        },
      },
    ],
    [canManageTasks, onManageTasks],
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
    <Card className={className}>
      <CardHeader
      >
        <div>
          <CardTitle>Order Items</CardTitle>
          <CardDescription className="mt-1 text-xs">
            Piece breakdown, assignments, and task controls.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {summary.total} pieces
          </Badge>
          <Badge variant="secondary" className="font-medium">
            {summary.inProgress} in progress
          </Badge>
          <Badge variant="outline" className="font-medium">
            {summary.completed} completed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <DataTableTanstack
          columns={columns}
          data={pagedItems}
          itemLabel="pieces"
          emptyMessage="No pieces found for this order."
          chrome="flat"
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={Math.max(1, Math.ceil(total / pageSize))}
          totalCount={total}
          manualPagination
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </CardContent>
    </Card>
  );
}
