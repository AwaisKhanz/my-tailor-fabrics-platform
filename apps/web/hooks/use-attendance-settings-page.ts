"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  attendanceClockInFormSchema,
  EmployeeStatus,
  type AttendanceRecord,
  type Employee,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";
import {
  useAttendanceList,
  useClockIn,
  useClockOut,
} from "@/hooks/queries/attendance-queries";
import { useEmployeesDropdown } from "@/hooks/queries/employee-queries";

const PAGE_SIZE = 20;
export const ALL_EMPLOYEES_FILTER = "all";
export const ALL_EMPLOYEES_FILTER_LABEL = "All Employees";
const ALL_EMPLOYEES_FILTER_OPTION = {
  value: ALL_EMPLOYEES_FILTER,
  label: ALL_EMPLOYEES_FILTER_LABEL,
} as const;

export type ClockInFieldErrors = Partial<Record<"employeeId" | "note", string>>;
export type EmployeeOption = {
  value: string;
  label: string;
};

export function useAttendanceSettingsPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      employeeId: ALL_EMPLOYEES_FILTER,
    },
  });

  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const employeeFilter = values.employeeId || ALL_EMPLOYEES_FILTER;
  const employeesQuery = useEmployeesDropdown();
  const attendanceQuery = useAttendanceList({
    page,
    limit: pageSize,
    employeeId:
      employeeFilter !== ALL_EMPLOYEES_FILTER ? employeeFilter : undefined,
  });
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const loading = attendanceQuery.isLoading;
  const employeesLoading = employeesQuery.isLoading;
  const records: AttendanceRecord[] = attendanceQuery.data?.success
    ? (attendanceQuery.data.data.data ?? [])
    : [];
  const total = attendanceQuery.data?.success
    ? (attendanceQuery.data.data.total ?? 0)
    : 0;

  const employees: Employee[] = employeesQuery.data?.success
    ? (employeesQuery.data.data.data ?? [])
    : [];

  const [clockInEmployeeId, setClockInEmployeeId] = useState("");
  const [clockInNote, setClockInNote] = useState("");
  const [clockInFieldErrors, setClockInFieldErrors] =
    useState<ClockInFieldErrors>({});
  const [clockInValidationError, setClockInValidationError] = useState("");
  const [clockingOutId, setClockingOutId] = useState<string | null>(null);
  const clockingIn = clockInMutation.isPending;

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const fetchAttendance = useCallback(async () => {
    try {
      await attendanceQuery.refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to load attendance records.",
        ),
        variant: "destructive",
      });
    }
  }, [attendanceQuery, toast]);

  useEffect(() => {
    if (!employeesQuery.isError) {
      return;
    }
    toast({
      title: "Error",
      description: "Failed to load employees.",
      variant: "destructive",
    });
  }, [employeesQuery.isError, toast]);

  useEffect(() => {
    if (!attendanceQuery.isError) {
      return;
    }
    toast({
      title: "Error",
      description: "Failed to load attendance records.",
      variant: "destructive",
    });
  }, [attendanceQuery.isError, toast]);

  const activeEmployees = useMemo(
    () =>
      employees.filter((employee) => employee.status === EmployeeStatus.ACTIVE),
    [employees],
  );

  const activeEmployeeOptions = useMemo<EmployeeOption[]>(
    () =>
      activeEmployees.map((employee) => ({
        value: employee.id,
        label: `${employee.fullName} (${employee.employeeCode})`,
      })),
    [activeEmployees],
  );

  const employeeFilterOptions = useMemo<EmployeeOption[]>(
    () => [ALL_EMPLOYEES_FILTER_OPTION, ...activeEmployeeOptions],
    [activeEmployeeOptions],
  );

  const employeesById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const openShiftsOnPage = useMemo(
    () => records.filter((record) => !record.clockOut).length,
    [records],
  );

  const hasActiveFilters = employeeFilter !== ALL_EMPLOYEES_FILTER;

  const refresh = useCallback(async () => {
    await Promise.all([fetchAttendance(), employeesQuery.refetch()]);
  }, [employeesQuery, fetchAttendance]);

  const applyEmployeeFilter = useCallback(
    (value: string) => {
      setValues({
        employeeId: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    resetValues();
  }, [resetValues]);

  const clockIn = useCallback(async () => {
    const parsedResult = attendanceClockInFormSchema.safeParse({
      employeeId: clockInEmployeeId,
      note: clockInNote,
    });

    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setClockInFieldErrors({
        employeeId: flattenedErrors.employeeId?.[0],
        note: flattenedErrors.note?.[0],
      });
      setClockInValidationError(
        flattenedErrors.employeeId?.[0] ??
          flattenedErrors.note?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return;
    }

    setClockInFieldErrors({});
    setClockInValidationError("");
    try {
      await clockInMutation.mutateAsync({
        employeeId: parsedResult.data.employeeId,
        note: parsedResult.data.note || undefined,
      });
      toast({
        title: "Clock-In Recorded",
        description: "Attendance entry created successfully.",
      });
      setClockInFieldErrors({});
      setClockInValidationError("");
      setClockInNote("");
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchAttendance();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to clock in employee.",
        ),
        variant: "destructive",
      });
    }
  }, [
    clockInEmployeeId,
    clockInMutation,
    clockInNote,
    fetchAttendance,
    page,
    toast,
  ]);

  const clockOut = useCallback(
    async (recordId: string) => {
      setClockingOutId(recordId);
      try {
        const employeeIdForRecord =
          records.find((record) => record.id === recordId)?.employeeId ??
          employeeFilter;
        await clockOutMutation.mutateAsync({
          recordId,
          employeeId:
            employeeIdForRecord && employeeIdForRecord !== ALL_EMPLOYEES_FILTER
              ? employeeIdForRecord
              : "",
        });
        toast({
          title: "Clock-Out Recorded",
          description: "Attendance entry updated successfully.",
        });
        await fetchAttendance();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(
            error,
            "Failed to clock out employee.",
          ),
          variant: "destructive",
        });
      } finally {
        setClockingOutId(null);
      }
    },
    [clockOutMutation, employeeFilter, fetchAttendance, records, toast],
  );

  return {
    loading,
    employeesLoading,
    records,
    total,
    page,
    pageSize,
    employees,
    activeEmployees,
    activeEmployeeOptions,
    employeeFilterOptions,
    employeesById,
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
    setClockInEmployeeId: (value: string) => {
      setClockInFieldErrors((previous) => ({
        ...previous,
        employeeId: undefined,
      }));
      setClockInValidationError("");
      setClockInEmployeeId(value);
    },
    setClockInNote: (value: string) => {
      setClockInFieldErrors((previous) => ({ ...previous, note: undefined }));
      setClockInValidationError("");
      setClockInNote(value);
    },
    clockIn,
    clockOut,
    refresh,
  };
}
