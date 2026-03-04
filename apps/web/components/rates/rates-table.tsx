import { useMemo } from "react";
import { Clock, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { formatPKR } from "@/lib/utils";
import { type RateWithIncludes } from "@/hooks/use-rates-page";

interface RatesTableProps {
  rates: RateWithIncludes[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function RatesTable({
  rates,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
}: RatesTableProps) {
  const columns = useMemo<ColumnDef<RateWithIncludes>[]>(
    () => [
      {
        header: "Garment Type",
        cell: (rate) => (
          <div className="font-medium text-text-primary">{rate.garmentType?.name || "Unknown"}</div>
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
            <Badge variant="outline" size="xs" className="gap-1">
              <GitBranch className="h-2.5 w-2.5" />
              {rate.branch?.code || "Branch"}
            </Badge>
          ) : (
            <Badge variant="secondary" size="xs">
              Global
            </Badge>
          ),
      },
      {
        header: "Rate",
        align: "right",
        cell: (rate) => <span className="font-bold text-ready">{formatPKR(rate.amount)}</span>,
      },
      {
        header: "Effective",
        align: "right",
        cell: (rate) => (
          <div className="flex flex-col items-end whitespace-nowrap">
            <Label variant="dashboard" className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {new Date(rate.effectiveFrom).toLocaleDateString()}
            </Label>
            {rate.effectiveTo ? (
              <Label variant="dashboard">until {new Date(rate.effectiveTo).toLocaleDateString()}</Label>
            ) : null}
          </div>
        ),
      },
    ],
    [],
  );

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
