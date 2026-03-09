"use client";

import { useCallback, useEffect, useMemo } from "react";
import type {
  AttendanceRecord,
  OrderItem,
  OrderItemTask,
} from "@tbms/shared-types";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const DEFAULT_TABLE_PAGE_SIZE = 10;

interface UseEmployeeDetailTabsTableStateParams {
  tasks: OrderItemTask[];
  items: OrderItem[];
  attendance: AttendanceRecord[];
}

export function useEmployeeDetailTabsTableState({
  tasks,
  items,
  attendance,
}: UseEmployeeDetailTabsTableStateParams) {
  const { setValues: setTaskValues, getPositiveInt: getTaskInt } =
    useUrlTableState({
      prefix: "employeeTasks",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });
  const { setValues: setHistoryValues, getPositiveInt: getHistoryInt } =
    useUrlTableState({
      prefix: "employeeHistory",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });
  const { setValues: setAttendanceValues, getPositiveInt: getAttendanceInt } =
    useUrlTableState({
      prefix: "employeeAttendance",
      defaults: {
        page: "1",
        limit: String(DEFAULT_TABLE_PAGE_SIZE),
      },
    });

  const taskPage = getTaskInt("page", 1);
  const taskLimit = getPositiveLimit(getTaskInt("limit", DEFAULT_TABLE_PAGE_SIZE));
  const taskTotal = tasks.length;
  const taskTotalPages = Math.max(1, Math.ceil(taskTotal / taskLimit));

  const historyPage = getHistoryInt("page", 1);
  const historyLimit = getPositiveLimit(
    getHistoryInt("limit", DEFAULT_TABLE_PAGE_SIZE),
  );
  const historyTotal = items.length;
  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / historyLimit));

  const attendancePage = getAttendanceInt("page", 1);
  const attendanceLimit = getPositiveLimit(
    getAttendanceInt("limit", DEFAULT_TABLE_PAGE_SIZE),
  );
  const attendanceTotal = attendance.length;
  const attendanceTotalPages = Math.max(
    1,
    Math.ceil(attendanceTotal / attendanceLimit),
  );

  const setTaskPage = useCallback(
    (nextPage: number) => {
      setTaskValues({ page: String(nextPage) });
    },
    [setTaskValues],
  );

  const setHistoryPage = useCallback(
    (nextPage: number) => {
      setHistoryValues({ page: String(nextPage) });
    },
    [setHistoryValues],
  );

  const setAttendancePage = useCallback(
    (nextPage: number) => {
      setAttendanceValues({ page: String(nextPage) });
    },
    [setAttendanceValues],
  );

  useEffect(() => {
    if (taskPage > taskTotalPages) {
      setTaskPage(taskTotalPages);
    }
  }, [setTaskPage, taskPage, taskTotalPages]);

  useEffect(() => {
    if (historyPage > historyTotalPages) {
      setHistoryPage(historyTotalPages);
    }
  }, [historyPage, historyTotalPages, setHistoryPage]);

  useEffect(() => {
    if (attendancePage > attendanceTotalPages) {
      setAttendancePage(attendanceTotalPages);
    }
  }, [attendancePage, attendanceTotalPages, setAttendancePage]);

  const pagedTasks = useMemo(() => {
    const start = (taskPage - 1) * taskLimit;
    return tasks.slice(start, start + taskLimit);
  }, [taskLimit, taskPage, tasks]);

  const pagedItems = useMemo(() => {
    const start = (historyPage - 1) * historyLimit;
    return items.slice(start, start + historyLimit);
  }, [historyLimit, historyPage, items]);

  const pagedAttendance = useMemo(() => {
    const start = (attendancePage - 1) * attendanceLimit;
    return attendance.slice(start, start + attendanceLimit);
  }, [attendance, attendanceLimit, attendancePage]);

  return {
    taskPage,
    taskLimit,
    taskTotal,
    setTaskPage,
    pagedTasks,
    historyPage,
    historyLimit,
    historyTotal,
    setHistoryPage,
    pagedItems,
    attendancePage,
    attendanceLimit,
    attendanceTotal,
    setAttendancePage,
    pagedAttendance,
  };
}

function getPositiveLimit(value: number) {
  return value > 0 ? value : DEFAULT_TABLE_PAGE_SIZE;
}
