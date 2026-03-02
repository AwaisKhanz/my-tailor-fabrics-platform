import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(branchId?: string): Promise<{
        revenue: number;
        expenses: number;
        outstandingBalances: number;
        overdueOrders: number;
        overdueCount: number;
        totalOrders: number;
        newToday: number;
        totalOutstandingBalance: number;
        totalCustomers: number;
        activeEmployees: number;
        recentOrders: any;
    }>;
    getRevenueVsExpenses(branchId?: string, months?: number): Promise<{
        revenue: {
            month: Date;
            total: number;
        }[];
        expenses: {
            month: Date;
            total: number;
        }[];
    }>;
    getGarmentTypesRevenue(branchId?: string): Promise<{
        label: string;
        value: number;
    }[]>;
    getEmployeeProductivity(branchId?: string): Promise<{
        label: string;
        value: number;
    }[]>;
    getDesignAnalytics(branchId?: string, from?: string, to?: string): Promise<{
        name: string;
        count: number;
        revenue: number;
        payout: number;
    }[]>;
    getAddonAnalytics(branchId?: string, from?: string, to?: string): Promise<{
        type: string;
        count: number;
        total: number;
    }[]>;
    getSummary(branchId?: string, from?: string, to?: string): Promise<{
        totalDesignRevenue: number;
        totalAddonRevenue: number;
        designs: {
            name: string;
            count: number;
            revenue: number;
            payout: number;
        }[];
        addons: {
            type: string;
            count: number;
            total: number;
        }[];
        revenue: number;
        expenses: number;
        outstandingBalances: number;
        overdueOrders: number;
        overdueCount: number;
        totalOrders: number;
        newToday: number;
        totalOutstandingBalance: number;
        totalCustomers: number;
        activeEmployees: number;
        recentOrders: any;
    }>;
}
