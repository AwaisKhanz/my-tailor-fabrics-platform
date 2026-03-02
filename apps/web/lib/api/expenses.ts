import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';

import { Expense, ExpenseCategory } from '@tbms/shared-types';

export type { Expense, ExpenseCategory };

export const expensesApi = {
  getExpenses: async (params?: { categoryId?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Expense>>>('/expenses', { params });
    return response.data;
  },

  getCategories: async () => {
    // Note: Assuming there's an endpoint for categories or it's part of config
    const response = await api.get<ApiResponse<ExpenseCategory[]>>('/expenses/categories');
    return response.data;
  },

  createExpense: async (data: {
    categoryId: string;
    amount: number;
    description?: string;
    expenseDate: string;
    receiptUrl?: string;
    branchId?: string;
  }) => {
    const response = await api.post<ApiResponse<Expense>>('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: Partial<Expense>) => {
    const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/expenses/${id}`);
    return response.data;
  },
};
