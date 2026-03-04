"use client";

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, GitBranch } from "lucide-react";
import { type RateCard } from "@tbms/shared-types";
import { formatPKR } from "@/lib/utils";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

type RateWithIncludes = RateCard & { branch?: { code: string; name: string } | null };

interface RatesListProps {
  rates: RateWithIncludes[];
  showBranch?: boolean;
}

export function RatesList({ rates, showBranch = true }: RatesListProps) {
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
      data={rates}
      emptyMessage="No rates defined yet."
      itemLabel="rates"
      chrome="flat"
    />
  );
}
