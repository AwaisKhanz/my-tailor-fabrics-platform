import { PrismaService } from '../prisma/prisma.service';
import type { CreateLedgerEntryInput, LedgerStatementParams, LedgerSummary } from '@tbms/shared-types';
export declare class LedgerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createEntry(dto: CreateLedgerEntryInput): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
        amount: number;
        createdById: string | null;
        note: string | null;
        type: import(".prisma/client").$Enums.LedgerEntryType;
        orderItemTaskId: string | null;
        paymentId: string | null;
    }>;
    getBalance(employeeId: string): Promise<LedgerSummary>;
    getStatement(employeeId: string, options?: LedgerStatementParams): Promise<{
        entries: ({
            branch: {
                id: string;
                name: string;
                code: string;
            };
            employee: {
                id: string;
                fullName: string;
            };
            createdBy: {
                id: string;
                name: string;
            } | null;
            orderItemTask: {
                id: string;
                stepKey: string;
                stepName: string;
                orderItem: {
                    garmentTypeName: string;
                    order: {
                        orderNumber: string;
                    };
                };
            } | null;
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            amount: number;
            createdById: string | null;
            note: string | null;
            type: import(".prisma/client").$Enums.LedgerEntryType;
            orderItemTaskId: string | null;
            paymentId: string | null;
        })[];
        summary: LedgerSummary;
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    getEarningsByPeriod(employeeId: string, weeksBack?: number): Promise<{
        period: Date;
        earned: number;
        paid: number;
        closingBalance: number;
    }[]>;
    remove(id: string, branchId: string): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
        amount: number;
        createdById: string | null;
        note: string | null;
        type: import(".prisma/client").$Enums.LedgerEntryType;
        orderItemTaskId: string | null;
        paymentId: string | null;
    }>;
}
