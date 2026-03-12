import { useCallback, useMemo } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { type Payment } from "@tbms/shared-types";
import { Button } from "@tbms/ui/components/button";
import { DataTableColumnHeader } from "@tbms/ui/components/data-table-column-header";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { Input } from "@tbms/ui/components/input";
import { TableSurface, TableToolbar } from "@tbms/ui/components/table-layout";
import { resolveUpdater } from "@/lib/tanstack";
import { formatDate, formatPKR } from "@/lib/utils";
import {
  type PaymentHistoryFilters,
  type PaymentHistorySortField,
  type PaymentHistorySortOrder,
} from "@/hooks/use-payments-data";

interface PaymentsHistorySectionProps {
  history: Payment[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  filters: PaymentHistoryFilters;
  activeFilterCount: number;
  sortBy: PaymentHistorySortField;
  sortOrder: PaymentHistorySortOrder;
  canManagePayments?: boolean;
  reversingPaymentId?: string | null;
  onPageChange: (page: number) => void;
  onSortChange: (
    sortBy: PaymentHistorySortField,
    sortOrder: PaymentHistorySortOrder,
  ) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onResetFilters: () => void;
  onReversePayment?: (paymentId: string) => void;
}

function isPaymentSortField(value: string): value is PaymentHistorySortField {
  return value === "paidAt" || value === "createdAt" || value === "amount";
}

export function PaymentsHistorySection({
  history,
  loading,
  page,
  total,
  limit,
  filters,
  activeFilterCount,
  sortBy,
  sortOrder,
  canManagePayments = false,
  reversingPaymentId = null,
  onPageChange,
  onSortChange,
  onFromChange,
  onToChange,
  onResetFilters,
  onReversePayment,
}: PaymentsHistorySectionProps) {
  const columns = useMemo<ColumnDef<Payment>[]>(() => {
    const actionColumn: ColumnDef<Payment> | null =
      canManagePayments && onReversePayment
        ? {
            id: "actions",
            enableSorting: false,
            header: "Actions",
            cell: ({ row }) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={reversingPaymentId === row.original.id}
                onClick={() => onReversePayment(row.original.id)}
              >
                {reversingPaymentId === row.original.id
                  ? "Reversing..."
                  : "Reverse"}
              </Button>
            ),
          }
        : null;

    return [
      {
        accessorKey: "paidAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Paid Date" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">
              {formatDate(row.original.paidAt)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "note",
        enableSorting: false,
        header: "Note",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.note || "—"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              column={column}
              title="Amount"
              className="ml-auto"
            />
          </div>
        ),
        cell: ({ row }) => (
          <span className="font-bold text-primary">
            {formatPKR(row.original.amount)}
          </span>
        ),
      },
      ...(actionColumn ? [actionColumn] : []),
    ];
  }, [canManagePayments, onReversePayment, reversingPaymentId]);

  const hasActiveFilters = activeFilterCount > 0;
  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize: limit,
    }),
    [limit, page],
  );

  const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(
    () => [
      {
        id: sortBy,
        desc: sortOrder === "desc",
      },
    ],
    [sortBy, sortOrder],
  );

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const next = resolveUpdater(updater, sorting);
      const firstSort = next[0];

      if (!firstSort) {
        onSortChange("paidAt", "desc");
        return;
      }

      if (!isPaymentSortField(firstSort.id)) {
        return;
      }

      onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
    },
    [onSortChange, sorting],
  );

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <TableSurface>
      <TableToolbar
        title="Payment Ledger"
        total={total}
        totalLabel="payments"
        activeFilterCount={activeFilterCount}
        controls={(
          <div className="flex w-full flex-wrap items-end gap-3">
            <Input
              type="date"
              className="w-full md:w-48"
              value={filters.from}
              onChange={(event) => onFromChange(event.target.value)}
            />
            <Input
              type="date"
              className="w-full md:w-48"
              value={filters.to}
              onChange={(event) => onToChange(event.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className="md:ml-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        )}
      />

      <DataTableTanstack
        columns={columns}
        data={history}
        loading={loading}
        chrome="flat"
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        pageCount={pageCount}
        totalCount={total}
        manualPagination
        sorting={sorting}
        onSortingChange={handleSortingChange}
        manualSorting
        itemLabel="payments"
        emptyMessage="No payment records found for this employee."
      />
    </TableSurface>
  );
}
