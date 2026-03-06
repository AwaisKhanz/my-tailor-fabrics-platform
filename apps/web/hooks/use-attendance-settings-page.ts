"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  attendanceClockInFormSchema,
  EmployeeStatus,
  type AttendanceRecord,
  type Employee,
} from "@tbms/shared-types";
import { attendanceApi } from "@/lib/api/attendance";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessageOrFallback } from "@/lib/utils/error";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 20;
export const ALL_EMPLOYEES_FILTER = "all";
type ClockInFieldErrors = Partial<Record<"employeeId" | "note", string>>;

export function useAttendanceSettingsPage() {
  const { toast } = useToast();
  const { values, setValues, resetValues, getPositiveInt } = useUrlTableState({
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      employeeId: ALL_EMPLOYEES_FILTER,
    },
  });

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeFilter = values.employeeId || ALL_EMPLOYEES_FILTER;

  const [clockInEmployeeId, setClockInEmployeeId] = useState("");
  const [clockInNote, setClockInNote] = useState("");
  const [clockInFieldErrors, setClockInFieldErrors] = useState<ClockInFieldErrors>({});
  const [clockInValidationError, setClockInValidationError] = useState("");
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOutId, setClockingOutId] = useState<string | null>(null);

  const setPage = useCallback((nextPage: number) => {
    setValues({ page: String(nextPage) });
  }, [setValues]);

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const response = await employeesApi.getEmployees({ page: 1, limit: 200 });
      if (response.success) {
        setEmployees(response.data.data ?? []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(error, "Failed to load employees."),
        variant: "destructive",
      });
    } finally {
      setEmployeesLoading(false);
    }
  }, [toast]);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await attendanceApi.getAttendance({
        page,
        limit: pageSize,
        employeeId:
          employeeFilter !== ALL_EMPLOYEES_FILTER ? employeeFilter : undefined,
      });
      if (response.success) {
        setRecords(response.data.data ?? []);
        setTotal(response.data.total ?? 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(error, "Failed to load attendance records."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, page, pageSize, toast]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.status === EmployeeStatus.ACTIVE),
    [employees],
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
    await Promise.all([fetchAttendance(), fetchEmployees()]);
  }, [fetchAttendance, fetchEmployees]);

  const applyEmployeeFilter = useCallback((value: string) => {
    setValues({
      employeeId: value,
      page: "1",
    });
  }, [setValues]);

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
    setClockingIn(true);
    try {
      await attendanceApi.clockIn(
        parsedResult.data.employeeId,
        parsedResult.data.note || undefined,
      );
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
        description: getApiErrorMessageOrFallback(error, "Failed to clock in employee."),
        variant: "destructive",
      });
    } finally {
      setClockingIn(false);
    }
  }, [clockInEmployeeId, clockInNote, fetchAttendance, page, toast]);

  const clockOut = useCallback(
    async (recordId: string) => {
      setClockingOutId(recordId);
      try {
        await attendanceApi.clockOut(recordId);
        toast({
          title: "Clock-Out Recorded",
          description: "Attendance entry updated successfully.",
        });
        await fetchAttendance();
      } catch (error) {
        toast({
          title: "Error",
          description: getApiErrorMessageOrFallback(error, "Failed to clock out employee."),
          variant: "destructive",
        });
      } finally {
        setClockingOutId(null);
      }
    },
    [fetchAttendance, toast],
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
      setClockInFieldErrors((previous) => ({ ...previous, employeeId: undefined }));
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
