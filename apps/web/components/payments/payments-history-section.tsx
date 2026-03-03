import { useMemo } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { type Payment } from "@tbms/shared-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Typography } from "@/components/ui/typography";
import { formatDate, formatPKR } from "@/lib/utils";
import { type PaymentHistoryFilters } from "@/hooks/use-payments-page";

interface PaymentsHistorySectionProps {
  history: Payment[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  filters: PaymentHistoryFilters;
  activeFilterCount: number;
  onPageChange: (page: number) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onResetFilters: () => void;
}

export function PaymentsHistorySection({
  history,
  loading,
  page,
  total,
  limit,
  filters,
  activeFilterCount,
  onPageChange,
  onFromChange,
  onToChange,
  onResetFilters,
}: PaymentsHistorySectionProps) {
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        header: "Paid Date",
        cell: (payment) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">{formatDate(payment.paidAt)}</span>
          </div>
        ),
      },
      {
        header: "Note",
        cell: (payment) => (
          <span className="text-xs text-muted-foreground">{payment.note || "—"}</span>
        ),
      },
      {
        header: "Amount",
        align: "right",
        cell: (payment) => (
          <span className="font-bold text-primary">{formatPKR(payment.amount)}</span>
        ),
      },
    ],
    [],
  );

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <Typography as="h2" variant="sectionTitle">
            Payment History
          </Typography>
          <Badge variant="secondary" size="xs">
            {total} records
          </Badge>
          {hasActiveFilters ? (
            <Badge variant="outline" size="xs" className="font-bold">
              {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label variant="dashboard">Paid From</Label>
            <Input
              variant="premium"
              type="date"
              className="h-10"
              value={filters.from}
              onChange={(event) => onFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label variant="dashboard">Paid To</Label>
            <Input
              variant="premium"
              type="date"
              className="h-10"
              value={filters.to}
              onChange={(event) => onToChange(event.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-full text-xs font-bold text-muted-foreground hover:text-foreground"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
          page={page}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
          itemLabel="payments"
          emptyMessage="No payment records found for this employee."
        />
      </div>
    </div>
  );
}
