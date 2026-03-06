import { api } from '../api';
import type {
  ApiResponse,
  CreateRateCardInput,
  RateCard,
  RateCardsListQueryInput,
  RateCardsListResult,
  RateHistoryQueryInput,
  RateStatsSummary,
  RateStatsQueryInput,
} from '@tbms/shared-types';
import { toPaisaFromRupees } from '@/lib/utils/money';

export const ratesApi = {
  findAll: async (params: RateCardsListQueryInput = {}) => {
    const response = await api.get<ApiResponse<RateCardsListResult>>('/rates', {
      params,
    });
    return response.data;
  },
  getHistory: async (
    garmentTypeId: string,
    stepKey: string,
    branchId?: string | null,
  ) => {
    const request: RateHistoryQueryInput = {
      garmentTypeId,
      stepKey,
      branchId,
    };
    const response = await api.get<ApiResponse<RateCard[]>>('/rates/history', {
      params: {
        garmentTypeId: request.garmentTypeId,
        stepKey: request.stepKey,
        branchId: request.branchId ?? undefined,
      },
    });
    return response.data;
  },
  getStats: async (params: RateStatsQueryInput = {}) => {
    const response = await api.get<ApiResponse<RateStatsSummary>>('/rates/stats', {
      params,
    });
    return response.data;
  },
  create: async (data: CreateRateCardInput) => {
    const payload: CreateRateCardInput = {
      ...data,
      amount: toPaisaFromRupees(data.amount),
    };
    const response = await api.post<ApiResponse<RateCard>>('/rates', payload);
    return response.data;
  }
};
