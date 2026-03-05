import { api } from '../api';
import type { 
  ApiResponse,
  GarmentStatsSummary,
  GarmentTypeListQueryInput,
  GarmentTypeListResult,
  GarmentType, 
  MeasurementCategory, 
  MeasurementCategoryListQueryInput,
  MeasurementCategoryListResult,
  MeasurementStats,
  MeasurementField,
  MeasurementSection,
  CreateMeasurementCategoryInput, 
  UpdateMeasurementCategoryInput,
  CreateMeasurementFieldInput,
  UpdateMeasurementFieldInput,
  CreateMeasurementSectionInput,
  CreateGarmentTypeInput,
  UpdateGarmentTypeInput,
  GarmentPriceLog,
  GarmentTypeWithAnalytics,
  WorkflowStepTemplate,
  UpdateGarmentWorkflowStepsInput,
  SystemSettings,
  UpdateSystemSettingsInput,
} from '@tbms/shared-types';

export const configApi = {
  // Garment Types
  getGarmentTypes: async (params: GarmentTypeListQueryInput = {}) => {
    const response = await api.get<ApiResponse<GarmentTypeListResult>>(
      '/config/garment-types',
      { params },
    );
    return response.data;
  },
  getGarmentType: async (id: string) => {
    const response = await api.get<ApiResponse<GarmentTypeWithAnalytics>>(`/config/garment-types/${id}`);
    return response.data;
  },
  createGarmentType: async (data: CreateGarmentTypeInput) => {
    const response = await api.post<ApiResponse<GarmentType>>('/config/garment-types', data);
    return response.data;
  },
  updateGarmentType: async (id: string, data: UpdateGarmentTypeInput) => {
    const response = await api.put<ApiResponse<GarmentType>>(`/config/garment-types/${id}`, data);
    return response.data;
  },
  deleteGarmentType: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/config/garment-types/${id}`);
    return response.data;
  },
  getGarmentStats: async () => {
    const response = await api.get<ApiResponse<GarmentStatsSummary>>('/config/garment-stats');
    return response.data;
  },
  updateGarmentWorkflowSteps: async (
    id: string,
    steps: UpdateGarmentWorkflowStepsInput["steps"],
  ) => {
    const response = await api.put<ApiResponse<WorkflowStepTemplate[]>>(
      `/config/garment-types/${id}/steps`,
      { steps },
    );
    return response.data;
  },

  // Pricing History
  getGarmentPriceHistory: async (garmentTypeId: string) => {
    const response = await api.get<ApiResponse<GarmentPriceLog[]>>(`/config/garment-types/${garmentTypeId}/history`);
    return response.data;
  },

  // Measurement Categories
  getMeasurementCategories: async (params: MeasurementCategoryListQueryInput = {}) => {
    const response = await api.get<ApiResponse<MeasurementCategoryListResult>>(
      '/config/measurement-categories',
      { params },
    );
    return response.data;
  },
  getMeasurementCategory: async (id: string) => {
    const response = await api.get<ApiResponse<MeasurementCategory>>(`/config/measurement-categories/${id}`);
    return response.data;
  },
  getMeasurementStats: async () => {
    const response = await api.get<ApiResponse<MeasurementStats>>('/config/measurement-stats');
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
  addMeasurementSection: async (
    categoryId: string,
    data: CreateMeasurementSectionInput,
  ) => {
    const response = await api.post<ApiResponse<MeasurementSection>>(
      `/config/measurement-categories/${categoryId}/sections`,
      data,
    );
    return response.data;
  },
  addMeasurementField: async (
    categoryId: string,
    data: CreateMeasurementFieldInput,
  ) => {
    const response = await api.post<ApiResponse<MeasurementField>>(
      `/config/measurement-categories/${categoryId}/fields`,
      data,
    );
    return response.data;
  },
  updateMeasurementField: async (
    fieldId: string,
    data: UpdateMeasurementFieldInput,
  ) => {
    const response = await api.put<ApiResponse<MeasurementField>>(
      `/config/measurement-fields/${fieldId}`,
      data,
    );
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
  
  // System Settings
  getSystemSettings: async () => {
    const response = await api.get<ApiResponse<SystemSettings>>('/config/settings');
    return response.data;
  },
  updateSystemSettings: async (data: UpdateSystemSettingsInput) => {
    const response = await api.put<ApiResponse<SystemSettings>>('/config/settings', data);
    return response.data;
  },
};
