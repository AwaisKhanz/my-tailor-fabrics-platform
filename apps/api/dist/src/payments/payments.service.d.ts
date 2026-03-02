import { PrismaService } from '../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly ledgerService;
    constructor(prisma: PrismaService, ledgerService: LedgerService);
    getEmployeeBalanceSummary(employeeId: string): Promise<{
        totalEarned: number;
        totalPaid: number;
        currentBalance: number;
        weekly: {
            week_start: Date;
            earned: number;
            paid: number;
            closing_balance: number;
        }[];
    }>;
    getWeeklyBreakdown(employeeId: string, weeksBack?: number): Promise<{
        week_start: Date;
        earned: number;
        paid: number;
        closing_balance: number;
    }[]>;
    disbursePay(employeeId: string, amount: number, processedById: string, branchId: string, note?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        amount: number;
        paidAt: Date;
        note: string | null;
        processedById: string;
    }>;
    getHistory(employeeId: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            amount: number;
            paidAt: Date;
            note: string | null;
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
