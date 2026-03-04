export interface Payment {
    id: string;
    employeeId: string;
    amount: number;
    paidAt: string;
    note?: string;
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
export interface WeeklyPaymentReportRow {
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    paidThisWeek: number;
}
