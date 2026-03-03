"use client";

import { useEffect, useMemo, useState } from "react";
import {
  reportsApi,
  type DesignAnalytics,
  type EmployeeProductivity,
  type GarmentRevenue,
  type RevenueVsExpenses,
} from "@/lib/api/reports";
import { type DashboardStats } from "@tbms/shared-types";

interface RevenueExpensesRow {
  month: string;
  revenue: number;
  expenses: number;
}

export function useDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [designs, setDesigns] = useState<DesignAnalytics[]>([]);
  const [productivity, setProductivity] = useState<EmployeeProductivity[]>([]);
  const [garments, setGarments] = useState<GarmentRevenue[]>([]);
  const [revenueExpenses, setRevenueExpenses] = useState<RevenueVsExpenses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const [statsData, designsData, productivityData, garmentsData, revenueExpensesData] =
          await Promise.all([
            reportsApi.getDashboardStats(),
            reportsApi.getDesigns(),
            reportsApi.getProductivity(),
            reportsApi.getGarments(),
            reportsApi.getRevenueVsExpenses(6),
          ]);

        if (cancelled) {
          return;
        }

        setStats(statsData);
        if (designsData.success) {
          setDesigns(designsData.data.slice(0, 5));
        }
        if (productivityData.success) {
          setProductivity(productivityData.data);
        }
        if (garmentsData.success) {
          setGarments(garmentsData.data);
        }
        if (revenueExpensesData.success) {
          setRevenueExpenses(revenueExpensesData.data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

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
        Array.from(revenueByMonth.keys()).concat(Array.from(expensesByMonth.keys())),
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
