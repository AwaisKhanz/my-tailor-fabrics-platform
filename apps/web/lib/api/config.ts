import { api } from '../api';
import { ApiResponse } from '@/types/common';
import { 
  GarmentType, 
  MeasurementCategory, 
  MeasurementField, 
  CreateMeasurementCategoryInput, 
  UpdateMeasurementCategoryInput,
  GarmentPriceLog,
  GarmentTypeWithAnalytics
} from '@tbms/shared-types';

export const configApi = {
  // Garment Types
  getGarmentTypes: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<{ data: GarmentType[]; total: number }>>(`/config/garment-types?${query.toString()}`);
    return response.data;
  },
  getGarmentType: async (id: string) => {
    const response = await api.get<ApiResponse<GarmentTypeWithAnalytics>>(`/config/garment-types/${id}`);
    return response.data;
  },
  createGarmentType: async (data: Partial<GarmentType> & { measurementCategoryIds?: string[] }) => {
    const response = await api.post<ApiResponse<GarmentType>>('/config/garment-types', data);
    return response.data;
  },
  updateGarmentType: async (id: string, data: Partial<GarmentType> & { measurementCategoryIds?: string[] }) => {
    const response = await api.put<ApiResponse<GarmentType>>(`/config/garment-types/${id}`, data);
    return response.data;
  },
  deleteGarmentType: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/config/garment-types/${id}`);
    return response.data;
  },
  getGarmentStats: async () => {
    const response = await api.get<ApiResponse<{ totalCount: number; avgRetailPrice: number; activeProduction: number }>>('/config/garment-stats');
    return response.data;
  },

  // Pricing History
  getGarmentPriceHistory: async (garmentTypeId: string) => {
    const response = await api.get<ApiResponse<GarmentPriceLog[]>>(`/config/garment-types/${garmentTypeId}/history`);
    return response.data;
  },

  // Measurement Categories
  getMeasurementCategories: async (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<{ data: MeasurementCategory[]; total: number }>>(`/config/measurement-categories?${query.toString()}`);
    return response.data;
  },
  createMeasurementCategory: async (data: CreateMeasurementCategoryInput) => {
    const response = await api.post<ApiResponse<MeasurementCategory>>('/config/measurement-categories', data);
    return response.data;
  },
  updateMeasurementCategory: async (id: string, data: UpdateMeasurementCategoryInput) => {
    const response = await api.put<ApiResponse<MeasurementCategory>>(`/config/measurement-categories/${id}`, data);
    return response.data;
  },
  addMeasurementField: async (categoryId: string, data: Partial<MeasurementField>) => {
    const response = await api.post<ApiResponse<MeasurementField>>(`/config/measurement-categories/${categoryId}/fields`, data);
    return response.data;
  },
  updateMeasurementField: async (fieldId: string, data: Partial<MeasurementField>) => {
    const response = await api.put<ApiResponse<MeasurementField>>(`/config/measurement-fields/${fieldId}`, data);
    return response.data;
  },
  deleteMeasurementField: async (fieldId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/config/measurement-fields/${fieldId}`);
    return response.data;
  },
  deleteMeasurementCategory: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/config/measurement-categories/${id}`);
    return response.data;
  },
};
