export interface PaymentSummary {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  weekly: {
    week_start: string;
    week_end: string;
    earned: number;
    paid: number;
    closing_balance: number;
  }[];
}
