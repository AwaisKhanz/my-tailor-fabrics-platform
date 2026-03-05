import { api } from '../api';
import type {
  ApiResponse,
  MailAuthUrlResponse,
  MailIntegrationStatus,
  MailTestResponse,
  SendTestMailInput,
} from '@tbms/shared-types';

export const mailApi = {
  getStatus: async () => {
    const response = await api.get<ApiResponse<MailIntegrationStatus>>(
      '/mail/status',
    );
    return response.data;
  },

  getAuthUrl: async () => {
    const response = await api.get<ApiResponse<MailAuthUrlResponse>>(
      '/mail/auth-url',
    );
    return response.data;
  },

  sendTestMail: async (payload: SendTestMailInput) => {
    const response = await api.post<ApiResponse<MailTestResponse>>(
      '/mail/test',
      payload,
    );
    return response.data;
  },
};
