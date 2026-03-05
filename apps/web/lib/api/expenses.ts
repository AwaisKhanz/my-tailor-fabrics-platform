import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';

import {
  CreateExpenseCategoryInput,
  ExpenseCategoryListQueryInput,
  ExpenseCategoryStatsSummary,
  CreateExpenseInput,
  Expense,
  ExpenseCategory,
  UpdateExpenseCategoryInput,
  UpdateExpenseInput,
} from '@tbms/shared-types';

export type { Expense, ExpenseCategory };

type PaginatedExpenseCategoriesResponse = PaginatedResponse<ExpenseCategory> & {
  stats: ExpenseCategoryStatsSummary;
  meta?: {
    page: number;
    lastPage: number;
  };
};

export const expensesApi = {
  getExpenses: async (params?: { categoryId?: string; from?: string; to?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Expense>>>('/expenses', { params });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<ApiResponse<ExpenseCategory[]>>('/expenses/categories');
    return response.data;
  },

  getCategoriesPaginated: async (query: ExpenseCategoryListQueryInput = {}) => {
    const params = {
      page: query.page,
      limit: query.limit,
      search: query.search?.trim() || undefined,
    };
    const response = await api.get<ApiResponse<PaginatedExpenseCategoriesResponse>>(
      '/expenses/categories/paginated',
      { params },
    );
    return response.data;
  },

  createCategory: async (data: CreateExpenseCategoryInput) => {
    const response = await api.post<ApiResponse<ExpenseCategory>>('/expenses/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateExpenseCategoryInput) => {
    const response = await api.put<ApiResponse<ExpenseCategory>>(`/expenses/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/expenses/categories/${id}`);
    return response.data;
  },

  createExpense: async (data: CreateExpenseInput) => {
    const response = await api.post<ApiResponse<Expense>>('/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: UpdateExpenseInput) => {
    const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/expenses/${id}`);
    return response.data;
  },
};
