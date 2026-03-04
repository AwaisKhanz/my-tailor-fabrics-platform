"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmployeeStatus,
  type AttendanceRecord,
  type Employee,
} from "@tbms/shared-types";
import { attendanceApi } from "@/lib/api/attendance";
import { employeesApi } from "@/lib/api/employees";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;
export const ALL_EMPLOYEES_FILTER = "all";

type ApiError = {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const response = (error as ApiError).response;
  const message = response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message[0] ?? fallback;
  }

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  return fallback;
}

export function useAttendanceSettingsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState(ALL_EMPLOYEES_FILTER);

  const [clockInEmployeeId, setClockInEmployeeId] = useState("");
  const [clockInNote, setClockInNote] = useState("");
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOutId, setClockingOutId] = useState<string | null>(null);

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
        description: getErrorMessage(error, "Failed to load employees."),
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
        limit: PAGE_SIZE,
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
        description: getErrorMessage(error, "Failed to load attendance records."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [employeeFilter, page, toast]);

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
    setEmployeeFilter(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setEmployeeFilter(ALL_EMPLOYEES_FILTER);
    setPage(1);
  }, []);

  const clockIn = useCallback(async () => {
    if (!clockInEmployeeId) {
      toast({
        title: "Validation",
        description: "Select an employee to clock in.",
        variant: "destructive",
      });
      return;
    }

    setClockingIn(true);
    try {
      await attendanceApi.clockIn(clockInEmployeeId, clockInNote.trim() || undefined);
      toast({
        title: "Clock-In Recorded",
        description: "Attendance entry created successfully.",
      });
      setClockInNote("");
      if (page !== 1) {
        setPage(1);
      } else {
        await fetchAttendance();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to clock in employee."),
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
          description: getErrorMessage(error, "Failed to clock out employee."),
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
    pageSize: PAGE_SIZE,
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
    setPage,
    applyEmployeeFilter,
    resetFilters,
    setClockInEmployeeId,
    setClockInNote,
    clockIn,
    clockOut,
    refresh,
  };
}
