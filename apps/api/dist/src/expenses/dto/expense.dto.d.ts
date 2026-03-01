export declare class CreateExpenseDto {
    categoryId: string;
    amount: number;
    description?: string;
    receiptUrl?: string;
    expenseDate: string;
}
export declare class UpdateExpenseDto {
    categoryId?: string;
    amount?: number;
    description?: string;
    receiptUrl?: string;
    expenseDate?: string;
}
