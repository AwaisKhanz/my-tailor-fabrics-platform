import { api } from '../api';
import { DesignType, ApiResponse } from '@tbms/shared-types';

export const designTypesApi = {
  findAll: async (params?: { branchId?: string; garmentTypeId?: string }) => {
    const response = await api.get<ApiResponse<DesignType[]>>('/design-types', { params });
    return response.data;
  },

  findOne: async (id: string) => {
    const response = await api.get<ApiResponse<DesignType>>(`/design-types/${id}`);
    return response.data;
  },

  create: async (data: Partial<DesignType>) => {
    const response = await api.post<ApiResponse<DesignType>>('/design-types', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DesignType>) => {
    const response = await api.patch<ApiResponse<DesignType>>(`/design-types/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/design-types/${id}`);
    return response.data;
  },

  seed: async () => {
    const response = await api.post<ApiResponse<void>>('/design-types/seed');
    return response.data;
  }
};
