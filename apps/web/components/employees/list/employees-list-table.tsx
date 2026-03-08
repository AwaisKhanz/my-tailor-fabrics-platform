import { useMemo } from "react";
import { ChevronRight, Phone } from "lucide-react";
import { type Employee } from "@tbms/shared-types";
import {
  EMPLOYEE_STATUS_BADGE,
  EMPLOYEE_STATUS_LABELS,
} from "@tbms/shared-constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";

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
        header: "Employee",
        cell: (employee) => (
          <div className="group flex items-center gap-3">
            <Avatar size="md" tone="framed">
              <AvatarFallback className="bg-primary/10 font-bold text-primary">
                {employee.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                {employee.fullName}
              </span>
              <Label className="text-sm font-bold uppercase  text-muted-foreground mt-0.5">
                {employee.employeeCode}
              </Label>
            </div>
          </div>
        ),
      },
      {
        header: "Designation",
        cell: (employee) => (
          <Badge variant="info" size="xs" className="font-semibold">
            {employee.designation || "Staff"}
          </Badge>
        ),
      },
      {
        header: "Contact",
        cell: (employee) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {employee.phone}
          </div>
        ),
      },
      {
        header: "Status",
        cell: (employee) => (
          <Badge
            variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"}
            size="xs"
            className="font-semibold"
          >
            {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (employee) => (
          <div className="flex justify-end pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                onViewEmployee(employee);
              }}
              aria-label={`Open ${employee.fullName}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onViewEmployee],
  );

  return (
    <DataTable
      columns={columns}
      data={employees}
      loading={loading}
      page={page}
      total={total}
      limit={pageSize}
      onPageChange={onPageChange}
      itemLabel="employees"
      emptyMessage="No employees found matching your criteria."
      chrome="flat"
      onRowClick={onViewEmployee}
    />
  );
}
