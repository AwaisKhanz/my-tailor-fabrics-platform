"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  Clock3,
  RefreshCcw,
  RotateCcw,
  UserCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSurface, TableToolbar } from "@/components/ui/table-layout";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
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
          <Card>
            <CardHeader surface="mutedSection" trimBottom>
              <SectionHeader
                title="Quick Clock-In"
                description="Record an employee shift start directly from admin settings."
                icon={
                  <SectionIcon size="sm">
                    <UserCheck className="h-4 w-4" />
                  </SectionIcon>
                }
              />
            </CardHeader>
            <CardContent
              spacing="section"
              className="grid gap-3 p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)_auto] md:items-end"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase  text-muted-foreground">
                  Employee
                </p>
                <Select
                  value={clockInEmployeeId}
                  onValueChange={setClockInEmployeeId}
                  disabled={employeesLoading || clockingIn}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        employeesLoading
                          ? "Loading employees..."
                          : "Select employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployeeOptions.map((employee) => (
                      <SelectItem key={employee.value} value={employee.value}>
                        {employee.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clockInFieldErrors.employeeId ? (
                  <p className="text-xs text-destructive">
                    {clockInFieldErrors.employeeId}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase  text-muted-foreground">
                  Note (Optional)
                </p>
                <Input
                  placeholder="Shift note or context..."
                  value={clockInNote}
                  onChange={(event) => setClockInNote(event.target.value)}
                  disabled={clockingIn}
                />
                {clockInFieldErrors.note ? (
                  <p className="text-xs text-destructive">
                    {clockInFieldErrors.note}
                  </p>
                ) : null}
              </div>

              <Button
                type="button"
                variant="default"
                disabled={clockingIn || !clockInEmployeeId}
                onClick={() => void clockIn()}
                className="w-full md:w-auto"
              >
                <Clock3 className="h-4 w-4" />
                {clockingIn ? "Clocking In..." : "Clock In"}
              </Button>
              {clockInValidationError ? (
                <p className="md:col-span-3 text-sm text-destructive">
                  {clockInValidationError}
                </p>
              ) : null}
            </CardContent>
          </Card>
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
