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
export interface ReportSummary extends DashboardStats {
    totalDesignRevenue: number;
    totalAddonRevenue: number;
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
