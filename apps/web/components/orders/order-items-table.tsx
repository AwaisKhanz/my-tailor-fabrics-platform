import { useCallback, useEffect, useMemo } from "react";
import { CalendarDays, Scissors } from "lucide-react";
import { ItemStatus, OrderItem } from "@tbms/shared-types";
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
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatPKR } from "@/lib/utils";
import { useUrlTableState } from "@/hooks/use-url-table-state";

interface OrderItemsTableProps {
  items: OrderItem[];
  onManageTasks: (item: OrderItem) => void;
  canManageTasks?: boolean;
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

  const columns: ColumnDef<OrderItem>[] = [
    {
      header: "Piece",
      cell: (item) => (
        <span className="font-semibold text-foreground">#{item.pieceNo}</span>
      ),
    },
    {
      header: "Item",
      cell: (item) => (
        <div className="flex min-w-[180px] items-start gap-2">
          <Scissors className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {item.garmentTypeName}
            </p>
            {item.designType ? (
              <FieldLabel className="mt-0.5" tone="primary">
                {item.designType.name}
              </FieldLabel>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      header: "Workflow",
      cell: (item) => {
        if (item.tasks && item.tasks.length > 0 && canManageTasks) {
          return (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold"
              onClick={() => onManageTasks(item)}
            >
              Manage Tasks
            </Button>
          );
        }

        return (
          <span className="text-xs font-medium text-muted-foreground">
            {item.tasks && item.tasks.length > 0
              ? "No permission to manage"
              : "No workflow steps"}
          </span>
        );
      },
    },
    {
      header: "Due",
      cell: (item) => (
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {item.dueDate ? formatShortDate(item.dueDate) : "-"}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => {
        return (
          <Badge
            variant={ITEM_STATUS_CONFIG[item.status].variant}

            className="uppercase "
          >
            {ITEM_STATUS_CONFIG[item.status].label}
          </Badge>
        );
      },
    },
    {
      header: "Amount",
      align: "right",
      cell: (item) => {
        const addonsTotal = (item.addons || []).reduce(
          (total, addon) => total + addon.price,
          0,
        );
        const designPrice = item.designType?.defaultPrice || 0;
        const total =
          item.unitPrice * item.quantity +
          designPrice * item.quantity +
          addonsTotal;

        return (
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">
              {formatPKR(total)}
            </p>
            {addonsTotal > 0 || designPrice > 0 ? (
              <p className="text-xs text-muted-foreground">
                +{formatPKR(addonsTotal + designPrice)} extras
              </p>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <Card>
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
        <DataTable
          columns={columns}
          data={pagedItems}
          itemLabel="pieces"
          emptyMessage="No pieces found for this order."
          chrome="flat"
          page={page}
          total={total}
          limit={pageSize}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
