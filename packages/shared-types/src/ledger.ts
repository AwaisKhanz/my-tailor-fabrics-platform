import { LedgerEntryType } from './common';

export interface EmployeeLedgerEntry {
  id: string;
  employeeId: string;
  employee?: { id: string; fullName: string };
  branchId: string;
  branch?: { id: string; name: string; code: string };
  type: LedgerEntryType;
  amount: number; // positive = earning, negative = payout/deduction
  orderItemTaskId?: string | null;
  orderItemTask?: {
    id: string;
    stepKey: string;
    stepName: string;
    orderItem?: {
      garmentTypeName: string;
      order?: { orderNumber: string };
    };
  } | null;
  paymentId?: string | null;
  payment?: { id: string; amount: number; paidAt: string | Date } | null;
  createdById?: string | null;
  createdBy?: { id: string; name: string } | null;
  note?: string | null;
  createdAt: string | Date;
  deletedAt?: string | Date | null;
}

export interface CreateLedgerEntryInput {
  employeeId: string;
  branchId: string;
  type: LedgerEntryType;
  amount: number; // positive = earning, negative = payout
  orderItemTaskId?: string | null;
  paymentId?: string | null;
  createdById?: string | null;
  note?: string | null;
}

export interface LedgerSummary {
  totalEarned: number;   // sum of all positive entries
  totalDeducted: number; // sum of all negative entries (abs value)
  currentBalance: number; // totalEarned + totalDeducted (net)
}

export interface LedgerStatement {
  entries: EmployeeLedgerEntry[];
  summary: LedgerSummary;
  meta: { total: number; page: number; lastPage: number };
}

export interface LedgerStatementParams {
  from?: string;
  to?: string;
  type?: LedgerEntryType | string;
  page?: number;
  limit?: number;
}

export interface EarningsByPeriod {
  period: string;     // ISO date string of period start
  earned: number;
  paid: number;
  closingBalance: number;
}
