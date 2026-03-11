"use client";

import { useMemo } from "react";
import {
  useDashboardDesigns,
  useDashboardGarments,
  useDashboardProductivity,
  useDashboardRevenueExpenses,
  useDashboardStats,
} from "@/hooks/queries/report-queries";

interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
}

export function useDashboardPage() {
  const statsQuery = useDashboardStats();
  const designsQuery = useDashboardDesigns();
  const productivityQuery = useDashboardProductivity();
  const garmentsQuery = useDashboardGarments();
  const revenueExpensesQuery = useDashboardRevenueExpenses(6);

  const loading =
    statsQuery.isLoading ||
    designsQuery.isLoading ||
    productivityQuery.isLoading ||
    garmentsQuery.isLoading ||
    revenueExpensesQuery.isLoading;
  const error =
    statsQuery.isError ||
    designsQuery.isError ||
    productivityQuery.isError ||
    garmentsQuery.isError ||
    revenueExpensesQuery.isError;

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
        new Date(item.month).toISOString(),
        item.total,
      ]),
    );
    const expensesByMonth = new Map(
      revenueExpenses.expenses.map((item) => [
        new Date(item.month).toISOString(),
        item.total,
      ]),
    );

    const months = Array.from(
      new Set(
        Array.from(revenueByMonth.keys()).concat(
          Array.from(expensesByMonth.keys()),
        ),
      ),
    ).sort();

    return months.map((monthIso) => ({
      month: new Date(monthIso).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      revenue: revenueByMonth.get(monthIso) ?? 0,
      expenses: expensesByMonth.get(monthIso) ?? 0,
    }));
  }, [revenueExpenses]);

  const totalGarmentItems = useMemo(
    () => garments.reduce((sum, garment) => sum + garment.value, 0),
    [garments],
  );

  return {
    loading,
    error,
    stats,
    designs,
    productivity,
    garments,
    revenueExpenseRows,
    totalGarmentItems,
  };
}
