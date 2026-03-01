import { api } from '../api';
import { ApiResponse } from '@/types/common';

export const customerLoyaltyApi = {
  toggleVip: async (customerId: string, isVip: boolean) => {
    const response = await api.patch<ApiResponse<{ id: string; isVip: boolean }>>(
      `/customers/${customerId}/vip`,
      { isVip },
    );
    return response.data;
  },
};
