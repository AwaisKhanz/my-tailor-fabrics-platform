"use client";

import { useCallback, useEffect, useMemo } from "react";
import type {
  OrderItem,
  OrderItemTask,
} from "@tbms/shared-types";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const DEFAULT_TABLE_PAGE_SIZE = 10;

interface UseEmployeeDetailTabsTableStateParams {
  tasks: OrderItemTask[];
  items: OrderItem[];
}

export function useEmployeeDetailTabsTableState({
  tasks,
  items,
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

  const pagedTasks = useMemo(() => {
    const start = (taskPage - 1) * taskLimit;
    return tasks.slice(start, start + taskLimit);
  }, [taskLimit, taskPage, tasks]);

  const pagedItems = useMemo(() => {
    const start = (historyPage - 1) * historyLimit;
    return items.slice(start, start + historyLimit);
  }, [historyLimit, historyPage, items]);

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
  };
}

function getPositiveLimit(value: number) {
  return value > 0 ? value : DEFAULT_TABLE_PAGE_SIZE;
}
