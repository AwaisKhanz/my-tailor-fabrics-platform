import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(branchId?: string): Promise<{
        revenue: number;
        expenses: number;
        outstandingBalances: number;
        overdueOrders: number;
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
}
