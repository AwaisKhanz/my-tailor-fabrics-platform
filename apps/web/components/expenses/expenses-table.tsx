import { useCallback, useMemo } from "react";
import { Calendar, Tag, Trash2 } from "lucide-react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { type Expense } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableColumnHeader } from "@tbms/ui/components/data-table-column-header";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import type {
  ExpenseSortField,
  ExpenseSortOrder,
} from "@/hooks/use-expenses-page";
import { resolveUpdater } from "@/lib/tanstack";
import { formatDate, formatPKR } from "@/lib/utils";

interface ExpensesTableProps {
  expenses: Expense[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  sortBy: ExpenseSortField;
  sortOrder: ExpenseSortOrder;
  deletingId: string | null;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: ExpenseSortField, sortOrder: ExpenseSortOrder) => void;
  onDeleteExpense: (expense: Expense) => void;
  canManageExpenses?: boolean;
}

function isExpenseSortField(value: string): value is ExpenseSortField {
  return value === "expenseDate" || value === "amount" || value === "createdAt";
}

export function ExpensesTable({
  expenses,
  loading,
  page,
  total,
  pageSize,
  sortBy,
  sortOrder,
  deletingId,
  onPageChange,
  onSortChange,
  onDeleteExpense,
  canManageExpenses = true,
}: ExpensesTableProps) {
  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        accessorKey: "expenseDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(row.original.expenseDate)}
            </span>
          </div>
        ),
      },
      {
        accessorFn: (expense) => expense.category.name,
        id: "categoryName",
        enableSorting: false,
        header: "Category",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary">
              {row.original.category.name}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "description",
        enableSorting: false,
        header: "Description",
        cell: ({ row }) => (
          <span className="block max-w-[420px] truncate text-sm text-muted-foreground">
            {row.original.description || "—"}
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
          <span className="font-bold text-destructive">
            {formatPKR(row.original.amount)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) =>
          canManageExpenses ? (
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteExpense(row.original);
              }}
              disabled={deletingId === row.original.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null,
      },
    ],
    [canManageExpenses, deletingId, onDeleteExpense],
  );

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: Math.max(page - 1, 0),
      pageSize,
    }),
    [page, pageSize],
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
        onSortChange("expenseDate", "desc");
        return;
      }

      if (!isExpenseSortField(firstSort.id)) {
        return;
      }

      onSortChange(firstSort.id, firstSort.desc ? "desc" : "asc");
    },
    [onSortChange, sorting],
  );

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={expenses}
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
      itemLabel="expenses"
      emptyMessage="No expenses found matching your criteria."
    />
  );
}
