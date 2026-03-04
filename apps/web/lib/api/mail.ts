import { api } from '../api';
import type {
  ApiResponse,
  MailAuthUrlResponse,
  MailIntegrationStatus,
  MailTestResponse,
  SendTestMailInput,
} from '@tbms/shared-types';

interface MailActionApiResponse extends MailTestResponse {
  success: boolean;
}

interface MailAuthUrlApiResponse extends MailAuthUrlResponse {
  success: boolean;
}

export const mailApi = {
  getStatus: async () => {
    const response = await api.get<ApiResponse<MailIntegrationStatus>>(
      '/mail/status',
    );
    return response.data;
  },

  getAuthUrl: async () => {
    const response = await api.get<MailAuthUrlApiResponse>('/mail/auth-url');
    return response.data;
  },

  sendTestMail: async (payload: SendTestMailInput) => {
    const response = await api.post<MailActionApiResponse>('/mail/test', payload);
    return response.data;
  },
};
