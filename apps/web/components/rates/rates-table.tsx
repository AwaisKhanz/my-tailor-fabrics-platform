import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Clock, GitBranch, Pencil } from "lucide-react";
import { type RateCardListItem } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";

interface RatesTableProps {
  rates: RateCardListItem[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAdjustRate?: (rate: RateCardListItem) => void;
}

export function RatesTable({
  rates,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onAdjustRate,
}: RatesTableProps) {
  const columns = useMemo<ColumnDef<RateCardListItem>[]>(() => {
    const baseColumns: ColumnDef<RateCardListItem>[] = [
      {
        id: "garmentType",
        accessorFn: (rate) => rate.garmentType?.name ?? "",
        header: "Garment Type",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.garmentType?.name || "Unknown"}
          </div>
        ),
      },
      {
        accessorKey: "stepKey",
        header: "Step",
        cell: ({ row }) => (
          <span className="font-bold">{row.original.stepKey}</span>
        ),
      },
      {
        id: "branch",
        enableSorting: false,
        header: "Branch",
        cell: ({ row }) =>
          row.original.branchId ? (
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {row.original.branch?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="default">
              Global
            </Badge>
          ),
      },
      {
        accessorKey: "amount",
        header: "Rate",
        cell: ({ row }) => (
          <span className="font-bold text-primary">
            {formatPKR(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: "effectiveFrom",
        header: "Effective",
        cell: ({ row }) => (
          <div className="flex flex-col items-end whitespace-nowrap">
            <FieldLabel className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(row.original.effectiveFrom).toLocaleDateString()}
            </FieldLabel>
            {row.original.effectiveTo ? (
              <FieldLabel>
                until {new Date(row.original.effectiveTo).toLocaleDateString()}
              </FieldLabel>
            ) : null}
          </div>
        ),
      },
    ];

    if (!onAdjustRate) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={(event) => {
              event.stopPropagation();
              onAdjustRate(row.original);
            }}
            aria-label={`Adjust ${row.original.stepKey} rate`}
            title="Adjust rate"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ];
  }, [onAdjustRate]);

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(() => [], []);
  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(() => {
    return;
  }, []);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={rates}
      loading={loading}
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      itemLabel="rate cards"
      emptyMessage="No rate cards match your search."
    />
  );
}
