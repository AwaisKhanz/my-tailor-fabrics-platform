"use client";

import { useRouter } from "next/navigation";
import { AttendanceLedgerSection } from "@/components/config/attendance/attendance-ledger-section";
import { AttendanceQuickClockInCard } from "@/components/config/attendance/attendance-quick-clock-in-card";
import { AttendanceSettingsPageHeader } from "@/components/config/attendance/attendance-settings-page-header";
import { AttendanceStatsGrid } from "@/components/config/attendance/attendance-stats-grid";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { buildEmployeeDetailRoute } from "@/lib/people-routes";
import { useAuthz } from "@/hooks/use-authz";
import { useAttendanceRecordColumns } from "@/hooks/use-attendance-record-columns";
import { useAttendanceSettingsPage } from "@/hooks/use-attendance-settings-page";
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
        <AttendanceSettingsPageHeader onRefresh={() => void refresh()} />
      </PageSection>

      <PageSection spacing="compact">
        <AttendanceStatsGrid
          total={total}
          openShiftsOnPage={openShiftsOnPage}
          activeEmployees={activeEmployees.length}
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
        <AttendanceLedgerSection
          columns={columns}
          records={records}
          loading={loading}
          total={total}
          page={page}
          pageSize={pageSize}
          employeeFilter={employeeFilter}
          employeeFilterOptions={employeeFilterOptions}
          employeesLoading={employeesLoading}
          hasActiveFilters={hasActiveFilters}
          setPage={setPage}
          applyEmployeeFilter={applyEmployeeFilter}
          resetFilters={resetFilters}
          onRowClick={(record) => {
            router.push(buildEmployeeDetailRoute(record.employeeId));
          }}
        />
      </PageSection>
    </PageShell>
  );
}
