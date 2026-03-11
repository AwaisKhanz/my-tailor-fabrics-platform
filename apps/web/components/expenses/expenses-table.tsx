import { useMemo } from "react";
import { Calendar, Tag, Trash2 } from "lucide-react";
import { type Expense } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { formatDate, formatPKR } from "@/lib/utils";

interface ExpensesTableProps {
  expenses: Expense[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  deletingId: string | null;
  onPageChange: (page: number) => void;
  onDeleteExpense: (expense: Expense) => void;
  canManageExpenses?: boolean;
}

export function ExpensesTable({
  expenses,
  loading,
  page,
  total,
  pageSize,
  deletingId,
  onPageChange,
  onDeleteExpense,
  canManageExpenses = true,
}: ExpensesTableProps) {
  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        header: "Date",
        cell: (expense) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {formatDate(expense.expenseDate)}
            </span>
          </div>
        ),
      },
      {
        header: "Category",
        cell: (expense) => (
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="secondary">
              {expense.category.name}
            </Badge>
          </div>
        ),
      },
      {
        header: "Description",
        cell: (expense) => (
          <span className="block max-w-[420px] truncate text-sm text-muted-foreground">
            {expense.description || "—"}
          </span>
        ),
      },
      {
        header: "Amount",
        align: "right",
        cell: (expense) => (
          <span className="font-bold text-destructive">
            {formatPKR(expense.amount)}
          </span>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (expense) =>
          canManageExpenses ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDeleteExpense(expense)}
              disabled={deletingId === expense.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null,
      },
    ],
    [canManageExpenses, deletingId, onDeleteExpense],
  );

  return (
    <DataTable
      columns={columns}
      data={expenses}
      loading={loading}
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      itemLabel="expenses"
      emptyMessage="No expenses found matching your criteria."
      chrome="flat"
    />
  );
}
