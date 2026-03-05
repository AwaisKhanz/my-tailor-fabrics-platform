"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, GitBranch } from "lucide-react";
import { type RateCard } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;

type RateWithIncludes = RateCard & { branch?: { code: string; name: string } | null };

interface RatesListProps {
  rates: RateWithIncludes[];
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

  const columns = useMemo<ColumnDef<RateWithIncludes>[]>(() => {
    const baseColumns: ColumnDef<RateWithIncludes>[] = [
      {
        header: "Step",
        accessorKey: "stepKey",
        className: "font-bold text-sm"
      }
    ];

    if (showBranch) {
      baseColumns.push({
        header: "Branch",
        cell: (rate) => (
          <>
            {rate.branchId ? (
              <Badge variant="outline" className="text-[10px] font-bold gap-1">
                <GitBranch className="h-2.5 w-2.5" />
                {rate.branch?.code || 'Branch'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] font-bold">Global</Badge>
            )}
          </>
        )
      });
    }

    baseColumns.push(
      {
        header: "Rate",
        align: "right",
        cell: (rate) => (
          <span className="font-black text-ready">
            {formatPKR(rate.amount)}
          </span>
        )
      },
      {
        header: "Effective",
        align: "right",
        cell: (rate) => (
          <div className="flex flex-col items-end whitespace-nowrap">
            <span className="flex items-center gap-1 font-medium text-text-primary text-[10px]">
              <Clock className="h-2.5 w-2.5" />
              {new Date(rate.effectiveFrom).toLocaleDateString()}
            </span>
            {rate.effectiveTo && (
              <span className="text-[10px] text-text-secondary">until {new Date(rate.effectiveTo).toLocaleDateString()}</span>
            )}
          </div>
        )
      }
    );

    return baseColumns;
  }, [showBranch]);

  return (
    <DataTable<RateWithIncludes>
      columns={columns}
      data={pagedRates}
      emptyMessage="No rates defined yet."
      itemLabel="rates"
      chrome="flat"
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={setPage}
    />
  );
}
