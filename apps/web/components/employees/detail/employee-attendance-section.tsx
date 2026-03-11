"use client";

import type { AttendanceRecord } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { DataTable, type ColumnDef } from "@tbms/ui/components/data-table";
import { EmployeeSection } from "@/components/employees/detail/employee-detail-section";

interface EmployeeAttendanceSectionProps {
  attendance: AttendanceRecord[];
  loading: boolean;
  page: number;
  total: number;
  limit: number;
  columns: ColumnDef<AttendanceRecord>[];
  onPageChange: (page: number) => void;
}

export function EmployeeAttendanceSection({
  attendance,
  loading,
  page,
  total,
  limit,
  columns,
  onPageChange,
}: EmployeeAttendanceSectionProps) {
  return (
    <EmployeeSection
      id="employee-attendance"
      title="Attendance"
      description="Review attendance logs and worked hours for this employee."
      badge={
        <Badge variant="default" className="font-semibold">
          {attendance.length} RECORDS
        </Badge>
      }
      defaultOpen={false}
    >
      <DataTable
        columns={columns}
        data={attendance}
        loading={loading}
        emptyMessage="No attendance records found."
        chrome="flat"
        page={page}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </EmployeeSection>
  );
}
