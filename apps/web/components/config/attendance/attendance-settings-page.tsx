"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Clock3,
  LogOut,
  RefreshCcw,
  RotateCcw,
  UserCheck,
  Users,
} from "lucide-react";
import { type AttendanceRecord } from "@tbms/shared-types";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
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
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useAuthz } from "@/hooks/use-authz";
import {
  ALL_EMPLOYEES_FILTER,
  useAttendanceSettingsPage,
} from "@/hooks/use-attendance-settings-page";

export function AttendanceSettingsPage() {
  const router = useRouter();
  const { canAll } = useAuthz();
  const canManageAttendanceEntries = canAll(["attendance.checkin"]);

  const {
    loading,
    employeesLoading,
    records,
    total,
    page,
    pageSize,
    activeEmployees,
    openShiftsOnPage,
    employeeFilter,
    hasActiveFilters,
    clockInEmployeeId,
    clockInNote,
    clockingIn,
    clockingOutId,
    setPage,
    applyEmployeeFilter,
    resetFilters,
    setClockInEmployeeId,
    setClockInNote,
    clockIn,
    clockOut,
    refresh,
  } = useAttendanceSettingsPage();

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
    () => [
      {
        header: "Date",
        cell: (record) => (
          <span className="text-sm font-medium text-foreground">
            {formatDate(record.date)}
          </span>
        ),
      },
      {
        header: "Employee",
        cell: (record) => (
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {record.employee?.fullName ?? "Unknown employee"}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.employee?.employeeCode ?? "No code"}
              {record.employee?.designation
                ? ` • ${record.employee.designation}`
                : ""}
            </p>
          </div>
        ),
      },
      {
        header: "Clock In",
        cell: (record) => (
          <span className="text-sm text-foreground">
            {formatDateTime(record.clockIn)}
          </span>
        ),
      },
      {
        header: "Clock Out",
        cell: (record) =>
          record.clockOut ? (
            <span className="text-sm text-foreground">
              {formatDateTime(record.clockOut)}
            </span>
          ) : (
            <Badge variant="warning" size="xs">
              In Progress
            </Badge>
          ),
      },
      {
        header: "Hours",
        align: "right",
        cell: (record) => (
          <span className="font-semibold text-foreground">
            {typeof record.hoursWorked === "number"
              ? `${record.hoursWorked.toFixed(2)}h`
              : "—"}
          </span>
        ),
      },
      {
        header: "Note",
        cell: (record) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {record.note || "—"}
          </span>
        ),
      },
      {
        header: "Actions",
        align: "right",
        cell: (record) =>
          record.clockOut ? (
            <span className="text-xs text-muted-foreground">Closed</span>
          ) : !canManageAttendanceEntries ? (
            <Badge variant="outline" size="xs">
              Open
            </Badge>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={clockingOutId === record.id}
              onClick={(event) => {
                event.stopPropagation();
                void clockOut(record.id);
              }}
            >
              <LogOut className="h-4 w-4" />
              Clock Out
            </Button>
        ),
      },
    ],
    [canManageAttendanceEntries, clockOut, clockingOutId],
  );

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

      <PageSection spacing="compact" className="grid space-y-0 gap-4 md:grid-cols-3">
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
          <Card className="border-border/70 bg-card/95">
            <CardHeader variant="section" className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <UserCheck className="h-4 w-4 text-primary" />
                Quick Clock-In
              </CardTitle>
              <CardDescription>
                Record an employee shift start directly from admin settings.
              </CardDescription>
            </CardHeader>
            <CardContent spacing="section" className="grid gap-3 p-5 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Employee
                </p>
                <Select
                  value={clockInEmployeeId}
                  onValueChange={setClockInEmployeeId}
                  disabled={employeesLoading || clockingIn}
                >
                  <SelectTrigger variant="table">
                    <SelectValue
                      placeholder={
                        employeesLoading ? "Loading employees..." : "Select employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Note (Optional)
                </p>
                <Input
                  variant="table"
                  placeholder="Shift note or context..."
                  value={clockInNote}
                  onChange={(event) => setClockInNote(event.target.value)}
                  disabled={clockingIn}
                />
              </div>

              <Button
                type="button"
                variant="premium"
                disabled={clockingIn || !clockInEmployeeId}
                onClick={() => void clockIn()}
                className="w-full md:w-auto"
              >
                <Clock3 className="h-4 w-4" />
                {clockingIn ? "Clocking In..." : "Clock In"}
              </Button>
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
                    <SelectTrigger variant="table">
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_EMPLOYEES_FILTER}>
                        All Employees
                      </SelectItem>
                      {activeEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.fullName} ({employee.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="tableReset"
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
              router.push(`/employees/${record.employeeId}`);
            }}
          />
        </TableSurface>
      </PageSection>
    </PageShell>
  );
}
