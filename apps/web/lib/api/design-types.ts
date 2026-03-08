import { api } from '../api';
import type {
  ApiResponse,
  CreateDesignTypeInput,
  DesignType,
  DesignTypesQueryInput,
  UpdateDesignTypeInput,
} from '@tbms/shared-types';

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
    const response = await api.post<ApiResponse<DesignType>>('/design-types', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDesignTypeInput) => {
    const response = await api.patch<ApiResponse<DesignType>>(`/design-types/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/design-types/${id}`);
    return response.data;
  },
};
