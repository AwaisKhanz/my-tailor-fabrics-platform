import { useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronRight, Phone } from "lucide-react";
import { type Employee } from "@tbms/shared-types";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Avatar, AvatarFallback } from "@tbms/ui/components/avatar";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import { DataTableTanstack } from "@tbms/ui/components/data-table-tanstack";
import { FieldLabel } from "@tbms/ui/components/field";
import { resolveUpdater } from "@/lib/tanstack";

interface EmployeesListTableProps {
  employees: Employee[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewEmployee: (employee: Employee) => void;
}

export function EmployeesListTable({
  employees,
  loading,
  page,
  total,
  pageSize,
  onPageChange,
  onViewEmployee,
}: EmployeesListTableProps) {
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Employee",
        cell: ({ row }) => (
          <div className="group flex items-center gap-3">
            <Avatar size="default" className="size-9">
              <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {row.original.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                {row.original.fullName}
              </span>
              <FieldLabel className="mt-0.5">
                {row.original.employeeCode}
              </FieldLabel>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-semibold">
            {row.original.designation || "Staff"}
          </Badge>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.original.phone}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={EMPLOYEE_STATUS_BADGE[row.original.status] ?? "outline"}

            className="font-semibold"
          >
            {EMPLOYEE_STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onViewEmployee(row.original);
              }}
              aria-label={`Open ${row.original.fullName}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onViewEmployee],
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
      const next =
        resolveUpdater(updater, pagination);
      onPageChange(next.pageIndex + 1);
    },
    [onPageChange, pagination],
  );

  const sorting = useMemo<SortingState>(() => [], []);
  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(() => {
    return;
  }, []);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTableTanstack
      columns={columns}
      data={employees}
      loading={loading}
      chrome="flat"
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      pageCount={pageCount}
      totalCount={total}
      manualPagination
      sorting={sorting}
      onSortingChange={handleSortingChange}
      itemLabel="employees"
      emptyMessage="No employees found matching your criteria."
      onRowClick={(row) => onViewEmployee(row.original)}
    />
  );
}
