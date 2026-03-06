import { LedgerEntryType } from './common';
export interface EmployeeLedgerEntry {
    id: string;
    employeeId: string;
    employee?: {
        id: string;
        fullName: string;
    };
    branchId: string;
    branch?: {
        id: string;
        name: string;
        code: string;
    };
    type: LedgerEntryType;
    amount: number;
    orderItemTaskId?: string | null;
    orderItemTask?: {
        id: string;
        stepKey: string;
        stepName: string;
        orderItem?: {
            garmentTypeName: string;
            order?: {
                orderNumber: string;
            };
        };
    } | null;
    paymentId?: string | null;
    payment?: {
        id: string;
        amount: number;
        paidAt: string | Date;
    } | null;
    createdById?: string | null;
    createdBy?: {
        id: string;
        name: string;
    } | null;
    note?: string | null;
    reversalNote?: string | null;
    reversedAt?: string | Date | null;
    reversedById?: string | null;
    reversalOfId?: string | null;
    createdAt: string | Date;
    deletedAt?: string | Date | null;
}
export interface CreateLedgerEntryInput {
    employeeId: string;
    branchId: string;
    type: LedgerEntryType;
    amount: number;
    orderItemTaskId?: string | null;
    paymentId?: string | null;
    createdById?: string | null;
    note?: string | null;
}
export interface CreateManualLedgerEntryInput {
    employeeId: string;
    type: LedgerEntryType;
    amount: number;
    branchId?: string;
    orderItemTaskId?: string | null;
    paymentId?: string | null;
    note?: string | null;
}
export interface ReverseLedgerEntryInput {
    note?: string;
}
export interface LedgerEntryReversalResult {
    originalEntryId: string;
    reversalEntryId: string;
    reversedAt: string;
    amount: number;
}
export interface LedgerSummary {
    totalEarned: number;
    totalDeducted: number;
    currentBalance: number;
}
export interface LedgerStatement {
    entries: EmployeeLedgerEntry[];
    summary: LedgerSummary;
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}
export interface LedgerStatementParams {
    from?: string;
    to?: string;
    type?: LedgerEntryType | string;
    page?: number;
    limit?: number;
}
export interface LedgerEarningsQueryInput {
    weeksBack?: number;
}
export interface EarningsByPeriod {
    period: string;
    earned: number;
    paid: number;
    closingBalance: number;
}
