import { PaginatedResponse } from './common';

export interface Payment {
  id: string;
  employeeId: string;
  amount: number;
  paidAt: string;
  note?: string;
  reversedAt?: string | null;
  reversedById?: string | null;
  reversalNote?: string | null;
}

export interface PaymentSummary {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  weekly: {
    week_start: string;
    week_end?: string;
    earned: number;
    paid: number;
    closing_balance: number;
  }[];
}

export interface DisbursePaymentInput {
  employeeId: string;
  amount: number;
  note?: string;
}

export interface ReversePaymentInput {
  note?: string;
}

export interface PaymentReversalResult {
  paymentId: string;
  reversalLedgerEntryId: string;
  amount: number;
  reversedAt: string;
}

export type SalaryAccrualSkipReason =
  | 'MISSING_MONTHLY_SALARY'
  | 'NO_MONTHLY_COMPENSATION_WINDOW'
  | 'NO_EMPLOYMENT_OVERLAP'
  | 'ZERO_AMOUNT_AFTER_PRORATION';

export type SalaryAccrualSource = 'MANUAL' | 'SCHEDULED';

export interface SalaryAccrualSkippedItem {
  employeeId: string;
  employeeName: string;
  reason: SalaryAccrualSkipReason;
}

export interface GenerateSalaryAccrualsInput {
  month?: string; // YYYY-MM
  employeeId?: string;
}

export interface SalaryAccrualGenerationResult {
  period: string; // YYYY-MM
  processed: number;
  created: number;
  alreadyExists: number;
  skipped: number;
  skippedItems: SalaryAccrualSkippedItem[];
}

export interface PaymentHistoryQueryInput {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type PaymentHistoryResult = PaginatedResponse<Payment>;

export interface WeeklyPaymentReportRow {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  paidThisWeek: number;
}
