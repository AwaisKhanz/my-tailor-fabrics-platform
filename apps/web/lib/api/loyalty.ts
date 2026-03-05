import { api } from '../api';
import type {
  ApiResponse,
  Customer,
  ToggleCustomerVipInput,
} from '@tbms/shared-types';

export const customerLoyaltyApi = {
  toggleVip: async (customerId: string, isVip: boolean) => {
    const payload: ToggleCustomerVipInput = { isVip };
    const response = await api.patch<ApiResponse<Customer>>(
      `/customers/${customerId}/vip`,
      payload,
    );
    return response.data;
  },
};
