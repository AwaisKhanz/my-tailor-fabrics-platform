import { PaginatedResponse } from './common';

export interface Expense {
  id: string;
  branchId: string;
  categoryId: string;
  amount: number;
  description?: string;
  receiptUrl?: string;
  expenseDate: string;
  createdAt: string;
  category: { id: string; name: string };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseCategoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateExpenseCategoryInput {
  name?: string;
  isActive?: boolean;
}

export interface ExpenseCategoryListQueryInput {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ExpenseCategoryStatsSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface ExpenseListQueryInput {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ExpenseListResult = PaginatedResponse<Expense>;

export type ExpenseCategoryListResult = PaginatedResponse<ExpenseCategory> & {
  stats: ExpenseCategoryStatsSummary;
};

export interface CreateExpenseInput {
  categoryId: string;
  amount: number;
  description?: string;
  receiptUrl?: string;
  expenseDate: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}
