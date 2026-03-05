import { api } from '../api';
import type {
  ApiResponse,
  CreateExpenseCategoryInput,
  ExpenseCategoryListResult,
  ExpenseCategoryListQueryInput,
  ExpenseListQueryInput,
  ExpenseListResult,
  CreateExpenseInput,
  Expense,
  ExpenseCategory,
  UpdateExpenseCategoryInput,
  UpdateExpenseInput,
} from '@tbms/shared-types';

export type { Expense, ExpenseCategory };

export const expensesApi = {
  getExpenses: async (params?: ExpenseListQueryInput) => {
    const response = await api.get<ApiResponse<ExpenseListResult>>('/expenses', { params });
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
    const response = await api.get<ApiResponse<ExpenseCategoryListResult>>(
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
