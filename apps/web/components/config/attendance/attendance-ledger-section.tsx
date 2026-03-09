"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";
import { ALL_EMPLOYEES_FILTER_LABEL, type EmployeeOption } from "@/hooks/use-attendance-settings-page";
import type { AttendanceRecord } from "@tbms/shared-types";

interface AttendanceLedgerSectionProps {
  columns: ColumnDef<AttendanceRecord>[];
  records: AttendanceRecord[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  employeeFilter: string;
  employeeFilterOptions: EmployeeOption[];
  employeesLoading: boolean;
  hasActiveFilters: boolean;
  setPage: (page: number) => void;
  applyEmployeeFilter: (value: string) => void;
  resetFilters: () => void;
  onRowClick: (record: AttendanceRecord) => void;
}

export function AttendanceLedgerSection({
  columns,
  records,
  loading,
  total,
  page,
  pageSize,
  employeeFilter,
  employeeFilterOptions,
  employeesLoading,
  hasActiveFilters,
  setPage,
  applyEmployeeFilter,
  resetFilters,
  onRowClick,
}: AttendanceLedgerSectionProps) {
  return (
    <TableSurface>
      <TableToolbar
        title="Attendance Ledger"
        total={total}
        totalLabel="records"
        activeFilterCount={hasActiveFilters ? 1 : 0}
        controls={
          <>
            <div className="w-full md:w-[280px]">
              <Select
                value={employeeFilter}
                onValueChange={applyEmployeeFilter}
                disabled={employeesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={ALL_EMPLOYEES_FILTER_LABEL} />
                </SelectTrigger>
                <SelectContent>
                  {employeeFilterOptions.map((employee) => (
                    <SelectItem key={employee.value} value={employee.value}>
                      {employee.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="md:ml-auto"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Reset
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        page={page}
        total={total}
        limit={pageSize}
        itemLabel="records"
        chrome="flat"
        emptyMessage="No attendance records found for the selected filter."
        onPageChange={setPage}
        onRowClick={onRowClick}
      />
    </TableSurface>
  );
}
