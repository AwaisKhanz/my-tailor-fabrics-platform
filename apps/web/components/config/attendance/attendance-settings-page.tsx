"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Clock3,
  RefreshCcw,
  RotateCcw,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";
import { DataTable } from "@/components/ui/data-table";
import { AttendanceQuickClockInCard } from "@/components/config/attendance/attendance-quick-clock-in-card";
import { buildEmployeeDetailRoute } from "@/lib/people-routes";
import { useAuthz } from "@/hooks/use-authz";
import { useAttendanceRecordColumns } from "@/hooks/use-attendance-record-columns";
import {
  ALL_EMPLOYEES_FILTER_LABEL,
  useAttendanceSettingsPage,
} from "@/hooks/use-attendance-settings-page";
import { PERMISSION } from "@tbms/shared-constants";

export function AttendanceSettingsPage() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageAttendanceEntries = canAll([PERMISSION["attendance.checkin"]]);

  const {
    loading,
    employeesLoading,
    records,
    total,
    page,
    pageSize,
    activeEmployees,
    activeEmployeeOptions,
    employeeFilterOptions,
    openShiftsOnPage,
    employeeFilter,
    hasActiveFilters,
    clockInEmployeeId,
    clockInNote,
    clockingIn,
    clockingOutId,
    clockInFieldErrors,
    clockInValidationError,
    setPage,
    applyEmployeeFilter,
    resetFilters,
    setClockInEmployeeId,
    setClockInNote,
    clockIn,
    clockOut,
    refresh,
  } = useAttendanceSettingsPage();

  const columns = useAttendanceRecordColumns({
    canManageAttendanceEntries,
    clockingOutId,
    clockOut,
  });

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Attendance Control"
          description="Monitor shifts, clock employees in, and resolve active attendance sessions."
          density="compact"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid space-y-0 gap-4 md:grid-cols-3"
      >
        <StatCard
          title="Attendance Records"
          subtitle="total matching"
          value={total.toLocaleString()}
          tone="primary"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Open Shifts"
          subtitle="current page"
          value={openShiftsOnPage.toLocaleString()}
          tone="warning"
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard
          title="Active Employees"
          subtitle="available for clock-in"
          value={activeEmployees.length.toLocaleString()}
          tone="success"
          icon={<Users className="h-4 w-4" />}
        />
      </PageSection>

      {canManageAttendanceEntries ? (
        <PageSection spacing="compact">
          <AttendanceQuickClockInCard
            employeesLoading={employeesLoading}
            activeEmployeeOptions={activeEmployeeOptions}
            clockInEmployeeId={clockInEmployeeId}
            clockInNote={clockInNote}
            clockingIn={clockingIn}
            clockInFieldErrors={clockInFieldErrors}
            clockInValidationError={clockInValidationError}
            setClockInEmployeeId={setClockInEmployeeId}
            setClockInNote={setClockInNote}
            clockIn={clockIn}
          />
        </PageSection>
      ) : null}

      <PageSection spacing="compact">
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
            onRowClick={(record) => {
              router.push(buildEmployeeDetailRoute(record.employeeId));
            }}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
