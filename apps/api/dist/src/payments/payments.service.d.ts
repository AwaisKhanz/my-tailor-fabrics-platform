import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEmployeeBalanceSummary(employeeId: string): Promise<{
        totalEarned: number;
        totalPaid: number;
        currentBalance: number;
        weekly: unknown;
    }>;
    getWeeklyBreakdown(employeeId: string, weeksBack?: number): Promise<unknown>;
    disbursePay(employeeId: string, amount: number, processedById: string, note?: string): Promise<{
        id: string;
        deletedAt: Date | null;
        employeeId: string;
        amount: number;
        note: string | null;
        paidAt: Date;
        processedById: string;
    }>;
    getHistory(employeeId: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: {
            id: string;
            deletedAt: Date | null;
            employeeId: string;
            amount: number;
            note: string | null;
            paidAt: Date;
            processedById: string;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    getWeeklyReport(): Promise<unknown>;
}
