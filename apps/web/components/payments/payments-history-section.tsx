import { useMemo } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { type Payment } from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";
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
  canManagePayments?: boolean;
  reversingPaymentId?: string | null;
  onPageChange: (page: number) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onResetFilters: () => void;
  onReversePayment?: (paymentId: string) => void;
}

export function PaymentsHistorySection({
  history,
  loading,
  page,
  total,
  limit,
  filters,
  activeFilterCount,
  canManagePayments = false,
  reversingPaymentId = null,
  onPageChange,
  onFromChange,
  onToChange,
  onResetFilters,
  onReversePayment,
}: PaymentsHistorySectionProps) {
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => {
      const actionColumn: ColumnDef<Payment> | null =
        canManagePayments && onReversePayment
          ? {
              header: "Actions",
              align: "right",
              cell: (payment) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={reversingPaymentId === payment.id}
                  onClick={() => onReversePayment(payment.id)}
                >
                  {reversingPaymentId === payment.id
                    ? "Reversing..."
                    : "Reverse"}
                </Button>
              ),
            }
          : null;

      return [
        {
          header: "Paid Date",
          cell: (payment) => (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                {formatDate(payment.paidAt)}
              </span>
            </div>
          ),
        },
        {
          header: "Note",
          cell: (payment) => (
            <span className="text-xs text-muted-foreground">
              {payment.note || "—"}
            </span>
          ),
        },
        {
          header: "Amount",
          align: "right",
          cell: (payment) => (
            <span className="font-bold text-primary">
              {formatPKR(payment.amount)}
            </span>
          ),
        },
        ...(actionColumn ? [actionColumn] : []),
      ];
    },
    [canManagePayments, onReversePayment, reversingPaymentId],
  );

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <TableSurface>
      <TableToolbar
        title="Payment Ledger"
        total={total}
        totalLabel="payments"
        activeFilterCount={activeFilterCount}
        controls={
          <>
            <div className="w-full sm:w-[180px]">
              <Label className="text-sm font-bold uppercase  text-muted-foreground mb-2 block">
                Paid From
              </Label>
              <Input
                type="date"
                value={filters.from}
                onChange={(event) => onFromChange(event.target.value)}
              />
            </div>

            <div className="w-full sm:w-[180px]">
              <Label className="text-sm font-bold uppercase  text-muted-foreground mb-2 block">
                Paid To
              </Label>
              <Input
                type="date"
                value={filters.to}
                onChange={(event) => onToChange(event.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center sm:ml-auto sm:w-auto sm:self-end"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          </>
        }
      />

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
        chrome="flat"
      />
    </TableSurface>
  );
}
