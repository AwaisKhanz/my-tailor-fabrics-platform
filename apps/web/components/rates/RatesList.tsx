"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Badge } from "@tbms/ui/components/badge";
import { Clock, GitBranch } from "lucide-react";
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { type RateCardListItem } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";
import { resolveUpdater } from "@/lib/tanstack";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

interface RatesListProps {
  rates: RateCardListItem[];
  showBranch?: boolean;
  paginationPrefix?: string;
}

export function RatesList({
  rates,
  showBranch = true,
  paginationPrefix = "rates",
}: RatesListProps) {
  const { setValues, getPositiveInt } = useUrlTableState({
    prefix: paginationPrefix,
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
    },
  });
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);
  const total = rates.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedRates = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rates.slice(start, start + pageSize);
  }, [page, pageSize, rates]);

  const columns = useMemo<ColumnDef<RateCardListItem>[]>(() => {
    const baseColumns: ColumnDef<RateCardListItem>[] = [
      {
        id: "stepKey",
        header: "Step",
        accessorKey: "stepKey",
        cell: ({ row }) => (
          <span className="text-sm font-bold">{row.original.stepKey}</span>
        ),
      },
    ];

    if (showBranch) {
      baseColumns.push({
        id: "branch",
        header: "Branch",
        cell: ({ row }) => (
          <>
            {row.original.branchId ? (
              <Badge variant="outline" className="text-xs font-bold gap-1">
                <GitBranch className="h-2.5 w-2.5" />
                {row.original.branch?.code || "Branch"}
              </Badge>
            ) : (
              <Badge variant="default" className="text-xs font-bold">Global</Badge>
            )}
          </>
        )
      });
    }

    baseColumns.push(
      {
        id: "rate",
        header: () => <div className="text-right">Rate</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <span className="font-black text-primary">
              {formatPKR(row.original.amount)}
            </span>
          </div>
        )
      },
      {
        id: "effective",
        header: () => <div className="text-right">Effective</div>,
        cell: ({ row }) => (
          <div className="flex flex-col items-end whitespace-nowrap text-right">
            <span className="flex items-center gap-1 font-medium text-foreground text-xs">
              <Clock className="h-2.5 w-2.5" />
              {new Date(row.original.effectiveFrom).toLocaleDateString()}
            </span>
            {row.original.effectiveTo && (
              <span className="text-xs text-muted-foreground">
                until {new Date(row.original.effectiveTo).toLocaleDateString()}
              </span>
            )}
          </div>
        )
      }
    );

    return baseColumns;
  }, [showBranch]);

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
    <DataTableTanstack
      columns={columns}
      data={pagedRates}
      emptyMessage="No rates defined yet."
      itemLabel="rates"
      chrome="flat"
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      pageCount={Math.max(1, Math.ceil(total / pageSize))}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={onSortingChange}
    />
  );
}
