import { api } from '../api';
import type {
  ApiResponse,
  AuditLogsListResult,
  AuditLogsQueryInput,
  AuditLogsStats,
} from '@tbms/shared-types';

interface AuditLogsListApiResponse {
  success: boolean;
  data: AuditLogsListResult['data'];
  total: number;
}

export const auditLogsApi = {
  getLogs: async (params: AuditLogsQueryInput = {}) => {
    const response = await api.get<AuditLogsListApiResponse>('/audit-logs', {
      params,
    });
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
