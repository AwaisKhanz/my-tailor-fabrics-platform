import { api } from '../api';
import type {
  ApiResponse,
  AuditLogsListResult,
  AuditLogsQueryInput,
  AuditLogsStats,
} from '@tbms/shared-types';

export const auditLogsApi = {
  getLogs: async (params: AuditLogsQueryInput = {}) => {
    const response = await api.get<ApiResponse<AuditLogsListResult>>(
      '/audit-logs',
      {
      params,
      },
    );
    return response.data;
  },

  getStats: async (params: Omit<AuditLogsQueryInput, 'page' | 'limit'> = {}) => {
    const response = await api.get<ApiResponse<AuditLogsStats>>(
      '/audit-logs/stats',
      { params },
    );
    return response.data;
  },
};
