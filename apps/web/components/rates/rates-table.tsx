import { useMemo } from "react";
import { Clock, GitBranch, Pencil } from "lucide-react";
import { type RateCardListItem } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { FieldLabel } from "@tbms/ui/components/field";
import { formatPKR } from "@/lib/utils";

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
        header: "Garment Type",
        cell: (rate) => (
          <div className="font-medium text-foreground">
            {rate.garmentType?.name || "Unknown"}
          </div>
        ),
      },
      {
        header: "Step",
        accessorKey: "stepKey",
        className: "font-bold",
      },
      {
        header: "Branch",
        cell: (rate) =>
          rate.branchId ? (
            <Badge variant="outline" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {rate.branch?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="default">
              Global
            </Badge>
          ),
      },
      {
        header: "Rate",
        align: "right",
        cell: (rate) => (
          <span className="font-bold text-primary">
            {formatPKR(rate.amount)}
          </span>
        ),
      },
      {
        header: "Effective",
        align: "right",
        cell: (rate) => (
          <div className="flex flex-col items-end whitespace-nowrap">
            <FieldLabel className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(rate.effectiveFrom).toLocaleDateString()}
            </FieldLabel>
            {rate.effectiveTo ? (
              <FieldLabel>
                until {new Date(rate.effectiveTo).toLocaleDateString()}
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
        header: "Actions",
        align: "right",
        cell: (rate) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={(event) => {
              event.stopPropagation();
              onAdjustRate(rate);
            }}
            aria-label={`Adjust ${rate.stepKey} rate`}
            title="Adjust rate"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ];
  }, [onAdjustRate]);

  return (
    <DataTable
      columns={columns}
      data={rates}
      loading={loading}
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      itemLabel="rate cards"
      emptyMessage="No rate cards match your search."
      chrome="flat"
    />
  );
}
