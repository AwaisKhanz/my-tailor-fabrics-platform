import { LedgerService } from './ledger.service';
import { LedgerEntryType } from '@tbms/shared-types';
import type { CreateLedgerEntryInput } from '@tbms/shared-types';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
export declare class LedgerController {
    private readonly ledgerService;
    constructor(ledgerService: LedgerService);
    createManualEntry(dto: CreateLedgerEntryInput, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getBalance(employeeId: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").LedgerSummary;
    }>;
    getStatement(employeeId: string, from?: string, to?: string, type?: LedgerEntryType, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
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
            summary: import("@tbms/shared-types").LedgerSummary;
            meta: {
                total: number;
                page: number;
                lastPage: number;
            };
        };
    }>;
    getEarnings(employeeId: string, weeksBack?: string): Promise<{
        success: boolean;
        data: {
            period: any;
            earned: number;
            paid: number;
            closingBalance: number;
        }[];
    }>;
    deleteEntry(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
}
