import { api } from '../api';
import { ApiResponse } from '@/types/common';
import type {
  EmployeeLedgerEntry,
  LedgerSummary,
  EarningsByPeriod,
  CreateManualLedgerEntryInput,
  LedgerStatement,
  LedgerStatementParams,
} from '@tbms/shared-types';

export const ledgerApi = {
  /** Get the current balance summary for an employee. */
  getBalance: async (employeeId: string) => {
    const response = await api.get<ApiResponse<LedgerSummary>>(
      `/ledger/${employeeId}/balance`
    );
    return response.data;
  },

  /** Get a paginated ledger statement with optional date range and type filters. */
  getStatement: async (
    employeeId: string,
    params: LedgerStatementParams = {},
  ) => {
    const response = await api.get<ApiResponse<LedgerStatement>>(
      `/ledger/${employeeId}/statement`,
      { params }
    );
    return response.data;
  },

  /** Get earnings grouped by week for the last N weeks. */
  getEarnings: async (employeeId: string, weeksBack = 12) => {
    const response = await api.get<ApiResponse<EarningsByPeriod[]>>(
      `/ledger/${employeeId}/earnings`,
      { params: { weeksBack } }
    );
    return response.data;
  },

  /** 
   * Create a new manual ledger entry.
   * @param data - The entry details. The `amount` field MUST be in **Paise** (integers).
   */
  createEntry: async (data: CreateManualLedgerEntryInput) => {
    const response = await api.post<ApiResponse<EmployeeLedgerEntry>>(
      '/ledger',
      data
    );
    return response.data;
  },

  /** Soft-delete a ledger entry. */
  deleteEntry: async (id: string) => {
    const response = await api.delete<ApiResponse<EmployeeLedgerEntry>>(
      `/ledger/${id}`
    );
    return response.data;
  },
};
