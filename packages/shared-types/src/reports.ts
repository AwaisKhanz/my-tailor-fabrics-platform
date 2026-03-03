import { DashboardStats } from './orders';

export interface DesignAnalytics {
  name: string;
  count: number;
  revenue: number;
  payout: number;
}

export interface AddonAnalytics {
  type: string;
  count: number;
  total: number;
}

export type TrendGranularity = 'day' | 'week' | 'month';

export interface FinancialTrendPoint {
  periodStart: string;
  label: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface FinancialTrend {
  granularity: TrendGranularity;
  points: FinancialTrendPoint[];
  totals: {
    revenue: number;
    expenses: number;
    net: number;
  };
}

export interface DistributionPoint {
  key: string;
  label: string;
  value: number;
  share: number;
}

export interface ReportDistributions {
  designs: DistributionPoint[];
  addons: DistributionPoint[];
  garments: DistributionPoint[];
}

export interface ProductivityPoint {
  employeeId: string;
  employeeName: string;
  completedItems: number;
  completedTasks: number;
  totalCompleted: number;
  payout: number;
}

export interface ReportSummary extends DashboardStats {
  totalDesignRevenue: number;
  totalAddonRevenue: number;
  net: number;
  previousPeriodRevenue?: number;
  previousPeriodExpenses?: number;
  previousPeriodNet?: number;
  revenueDelta?: number;
  expensesDelta?: number;
  netDelta?: number;
  designs: DesignAnalytics[];
  addons: AddonAnalytics[];
}

export interface MonthlyTotal {
  month: string | Date;
  total: number;
}

export interface RevenueVsExpenses {
  revenue: MonthlyTotal[];
  expenses: MonthlyTotal[];
}

export interface GarmentRevenue {
  label: string;
  value: number;
}

export interface EmployeeProductivity {
  label: string;
  value: number;
}
