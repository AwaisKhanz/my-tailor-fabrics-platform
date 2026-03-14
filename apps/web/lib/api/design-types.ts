import { api } from '../api';
import type {
  ApiResponse,
  CreateDesignTypeInput,
  DesignType,
  DesignTypesQueryInput,
  UpdateDesignTypeInput,
} from '@tbms/shared-types';
import { toPaisaFromRupees } from '@/lib/utils/money';

export const designTypesApi = {
  findAll: async (params: DesignTypesQueryInput = {}) => {
    const response = await api.get<ApiResponse<DesignType[]>>('/design-types', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get<ApiResponse<DesignType>>(`/design-types/${id}`);
    return response.data;
  },

  create: async (data: CreateDesignTypeInput) => {
    const payload: CreateDesignTypeInput = {
      ...data,
      defaultPrice: toPaisaFromRupees(data.defaultPrice),
      defaultRate: toPaisaFromRupees(data.defaultRate),
    };
    const response = await api.post<ApiResponse<DesignType>>('/design-types', payload);
    return response.data;
  },

  update: async (id: string, data: UpdateDesignTypeInput) => {
    const payload: UpdateDesignTypeInput = {
      ...data,
      defaultPrice:
        data.defaultPrice === undefined
          ? undefined
          : toPaisaFromRupees(data.defaultPrice),
      defaultRate:
        data.defaultRate === undefined
          ? undefined
          : toPaisaFromRupees(data.defaultRate),
    };
    const response = await api.patch<ApiResponse<DesignType>>(`/design-types/${id}`, payload);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/design-types/${id}`);
    return response.data;
  },
};
