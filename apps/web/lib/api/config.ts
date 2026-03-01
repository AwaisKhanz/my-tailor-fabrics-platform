import { api } from '../api';
import { ApiResponse } from '@/types/common';
import { 
  GarmentType, 
  BranchPriceOverride, 
  MeasurementCategory, 
  MeasurementField, 
  CreateMeasurementCategoryInput, 
  UpdateMeasurementCategoryInput,
  BranchPriceLog
} from '@tbms/shared-types';

export const configApi = {
  // Garment Types
  getGarmentTypes: async (params: { branchId?: string; search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.branchId) query.append('branchId', params.branchId);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    const response = await api.get<ApiResponse<{ data: GarmentType[]; total: number }>>(`/config/garment-types?${query.toString()}`);
    return response.data;
  },
  getGarmentType: async (id: string, branchId?: string) => {
    const query = new URLSearchParams();
    if (branchId) query.append('branchId', branchId);
    const response = await api.get<ApiResponse<GarmentType>>(`/config/garment-types/${id}?${query.toString()}`);
    return response.data;
  },
  createGarmentType: async (data: Partial<GarmentType>) => {
    const response = await api.post<ApiResponse<GarmentType>>('/config/garment-types', data);
    return response.data;
  },
  updateGarmentType: async (id: string, data: Partial<GarmentType>) => {
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

  // Branch Price Overrides
  getBranchPrices: async (garmentTypeId: string) => {
    const response = await api.get<ApiResponse<BranchPriceOverride[]>>(`/config/garment-types/${garmentTypeId}/branch-prices`);
    return response.data;
  },
  setBranchPrice: async (garmentTypeId: string, data: { customerPrice: number; employeeRate: number }, branchId?: string) => {
    const response = await api.put<ApiResponse<BranchPriceOverride>>(`/config/garment-types/${garmentTypeId}/branch-prices`, data, {
      headers: branchId ? { 'x-branch-id': branchId } : {}
    });
    return response.data;
  },
  deleteBranchPrice: async (garmentTypeId: string, branchId?: string) => {
    const response = await api.delete<ApiResponse<void>>(`/config/garment-types/${garmentTypeId}/branch-prices`, {
      headers: branchId ? { 'x-branch-id': branchId } : {}
    });
    return response.data;
  },

  getBranchPriceHistory: async (garmentTypeId: string, branchId?: string) => {
    const response = await api.get<ApiResponse<BranchPriceLog[]>>(`/config/garment-types/${garmentTypeId}/history`, {
      headers: branchId ? { 'x-branch-id': branchId } : {}
    });
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
