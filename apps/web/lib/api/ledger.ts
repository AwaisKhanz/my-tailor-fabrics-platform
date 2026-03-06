import { api } from '../api';
import type {
  ApiResponse,
  EmployeeLedgerEntry,
  LedgerSummary,
  EarningsByPeriod,
  CreateManualLedgerEntryInput,
  LedgerEarningsQueryInput,
  LedgerStatement,
  LedgerStatementParams,
  LedgerEntryReversalResult,
  ReverseLedgerEntryInput,
} from '@tbms/shared-types';
import { toSignedPaisaFromRupees } from '@/lib/utils/money';

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
    const params: LedgerEarningsQueryInput = { weeksBack };
    const response = await api.get<ApiResponse<EarningsByPeriod[]>>(
      `/ledger/${employeeId}/earnings`,
      { params }
    );
    return response.data;
  },

  /** 
   * Create a new manual ledger entry.
   * @param data - The entry details. The `amount` field is accepted in Rupees.
   */
  createEntry: async (data: CreateManualLedgerEntryInput) => {
    const payload: CreateManualLedgerEntryInput = {
      ...data,
      amount: toSignedPaisaFromRupees(data.amount),
    };
    const response = await api.post<ApiResponse<EmployeeLedgerEntry>>(
      '/ledger',
      payload
    );
    return response.data;
  },

  /** Reverse a manual ledger entry (immutable finance flow). */
  reverseEntry: async (id: string, data: ReverseLedgerEntryInput = {}) => {
    const response = await api.post<ApiResponse<LedgerEntryReversalResult>>(
      `/ledger/${id}/reverse`,
      data,
    );
    return response.data;
  },
};
