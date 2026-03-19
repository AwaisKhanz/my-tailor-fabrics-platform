import { api } from '../api';
import type {
  ApiResponse,
  CreateShopFabricInput,
  ShopFabric,
  ShopFabricListQueryInput,
  ShopFabricListResult,
  ShopFabricStatsSummary,
  UpdateShopFabricInput,
} from '@tbms/shared-types';
import { toPaisaFromRupees } from '@/lib/utils/money';

function toCreatePayload(data: CreateShopFabricInput): CreateShopFabricInput {
  return {
    ...data,
    sellingRate: toPaisaFromRupees(data.sellingRate),
  };
}

function toUpdatePayload(data: UpdateShopFabricInput): UpdateShopFabricInput {
  return {
    ...data,
    sellingRate:
      data.sellingRate === undefined
        ? undefined
        : toPaisaFromRupees(data.sellingRate),
  };
}

export const fabricsApi = {
  findAll: async (params: ShopFabricListQueryInput = {}) => {
    const response = await api.get<ApiResponse<ShopFabricListResult>>('/fabrics', {
      params,
    });
    return response.data;
  },

  getStats: async (params: Pick<ShopFabricListQueryInput, 'search'> = {}) => {
    const response = await api.get<ApiResponse<ShopFabricStatsSummary>>('/fabrics/stats', {
      params,
    });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get<ApiResponse<ShopFabric>>(`/fabrics/${id}`);
    return response.data;
  },

  create: async (data: CreateShopFabricInput) => {
    const response = await api.post<ApiResponse<ShopFabric>>(
      '/fabrics',
      toCreatePayload(data),
    );
    return response.data;
  },

  update: async (id: string, data: UpdateShopFabricInput) => {
    const response = await api.patch<ApiResponse<ShopFabric>>(
      `/fabrics/${id}`,
      toUpdatePayload(data),
    );
    return response.data;
  },
};
