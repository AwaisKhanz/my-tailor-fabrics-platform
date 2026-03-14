"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  useDashboardDesigns,
  useDashboardGarments,
  useDashboardProductivity,
  useDashboardRevenueExpenses,
  useDashboardStats,
} from "@/hooks/queries/report-queries";
import { readActiveBranchCookie } from "@/lib/branch-context";
import { useBranchStore } from "@/store/useBranchStore";

interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
}

interface UseDashboardPageOptions {
  enableDashboardStats?: boolean;
  enableReportingInsights?: boolean;
}

const monthKey = (value: string | Date) => {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function useDashboardPage({
  enableDashboardStats = true,
  enableReportingInsights = true,
}: UseDashboardPageOptions = {}) {
  const { activeBranchId, hydrate } = useBranchStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const selectedBranchId = useMemo(
    () => activeBranchId ?? readActiveBranchCookie() ?? undefined,
    [activeBranchId],
  );

  const statsQuery = useDashboardStats(selectedBranchId, enableDashboardStats);
  const designsQuery = useDashboardDesigns(
    undefined,
    undefined,
    selectedBranchId,
    enableReportingInsights,
  );
  const productivityQuery = useDashboardProductivity(
    selectedBranchId,
    enableReportingInsights,
  );
  const garmentsQuery = useDashboardGarments(
    selectedBranchId,
    undefined,
    undefined,
    enableReportingInsights,
  );
  const revenueExpensesQuery = useDashboardRevenueExpenses(
    6,
    selectedBranchId,
    enableReportingInsights,
  );

  const loading =
    (enableDashboardStats && statsQuery.isLoading) ||
    (enableReportingInsights && designsQuery.isLoading) ||
    (enableReportingInsights && productivityQuery.isLoading) ||
    (enableReportingInsights && garmentsQuery.isLoading) ||
    (enableReportingInsights && revenueExpensesQuery.isLoading);
  const refreshing =
    (enableDashboardStats && statsQuery.isFetching) ||
    (enableReportingInsights && designsQuery.isFetching) ||
    (enableReportingInsights && productivityQuery.isFetching) ||
    (enableReportingInsights && garmentsQuery.isFetching) ||
    (enableReportingInsights && revenueExpensesQuery.isFetching);
  const error =
    (enableDashboardStats && statsQuery.isError) ||
    (enableReportingInsights && designsQuery.isError) ||
    (enableReportingInsights && productivityQuery.isError) ||
    (enableReportingInsights && garmentsQuery.isError) ||
    (enableReportingInsights && revenueExpensesQuery.isError);

  const stats = statsQuery.data?.success ? statsQuery.data.data : null;
  const designs = designsQuery.data?.success
    ? designsQuery.data.data.slice(0, 5)
    : [];
  const productivity = productivityQuery.data?.success
    ? productivityQuery.data.data
    : [];
  const garments = garmentsQuery.data?.success ? garmentsQuery.data.data : [];
  const revenueExpenses = revenueExpensesQuery.data?.success
    ? revenueExpensesQuery.data.data
    : null;

  const revenueExpenseRows = useMemo<RevenueExpensesRow[]>(() => {
    if (!revenueExpenses) {
      return [];
    }

    const revenueByMonth = new Map(
      revenueExpenses.revenue.map((item) => [
        monthKey(item.month),
        item.total,
      ]),
    );
    const expensesByMonth = new Map(
      revenueExpenses.expenses.map((item) => [
        monthKey(item.month),
        item.total,
      ]),
    );

    const allMonthKeys = Array.from(
      new Set([
        ...Array.from(revenueByMonth.keys()),
        ...Array.from(expensesByMonth.keys()),
      ]),
    ).sort();

    const latestMonth = allMonthKeys.length
      ? new Date(`${allMonthKeys[allMonthKeys.length - 1]}-01T00:00:00.000Z`)
      : new Date();

    const monthsToShow = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(latestMonth);
      date.setUTCMonth(latestMonth.getUTCMonth() - (5 - index));
      return date;
    });

    return monthsToShow.map((date) => {
      const key = monthKey(date);
      return {
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        revenue: revenueByMonth.get(key) ?? 0,
        expenses: expensesByMonth.get(key) ?? 0,
      };
    });
  }, [revenueExpenses]);

  const totalGarmentItems = useMemo(
    () => garments.reduce((sum, garment) => sum + garment.value, 0),
    [garments],
  );

  const refreshDashboard = useCallback(async () => {
    const refreshes: Array<Promise<unknown>> = [];

    if (enableDashboardStats) {
      refreshes.push(statsQuery.refetch());
    }

    if (enableReportingInsights) {
      refreshes.push(
        designsQuery.refetch(),
        productivityQuery.refetch(),
        garmentsQuery.refetch(),
        revenueExpensesQuery.refetch(),
      );
    }

    await Promise.all(refreshes);
  }, [
    enableDashboardStats,
    enableReportingInsights,
    designsQuery.refetch,
    garmentsQuery.refetch,
    productivityQuery.refetch,
    revenueExpensesQuery.refetch,
    statsQuery.refetch,
  ]);

  return {
    loading,
    refreshing,
    error,
    stats,
    designs,
    productivity,
    garments,
    revenueExpenseRows,
    totalGarmentItems,
    refreshDashboard,
    selectedBranchId,
  };
}
