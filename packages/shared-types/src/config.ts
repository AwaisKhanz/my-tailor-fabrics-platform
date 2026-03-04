import { FieldType } from './common';

export interface MeasurementField {
  id: string;
  label: string;
  fieldType: FieldType;
  unit?: string | null;
  isRequired: boolean;
  sortOrder: number;
  dropdownOptions: string[];
}

export interface CreateMeasurementFieldInput {
  label: string;
  fieldType?: FieldType;
  unit?: string;
  isRequired?: boolean;
  sortOrder?: number;
  dropdownOptions?: string[];
}

export interface UpdateMeasurementFieldInput {
  label?: string;
  fieldType?: FieldType;
  unit?: string;
  isRequired?: boolean;
  sortOrder?: number;
  dropdownOptions?: string[];
}

export interface CreateMeasurementCategoryInput {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
  fields?: CreateMeasurementFieldInput[];
}

export interface UpdateMeasurementCategoryInput {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MeasurementCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  fields: MeasurementField[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface MeasurementStats {
  totalCategories: number;
  activeCategories: number;
  totalFields: number;
  requiredFields: number;
}

export interface GarmentType {
  id: string;
  name: string;
  customerPrice: number;
  employeeRate: number;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  measurementCategories?: MeasurementCategory[];
}

export interface CreateGarmentTypeInput {
  name: string;
  customerPrice: number;
  employeeRate: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  measurementCategoryIds?: string[];
}

export interface UpdateGarmentTypeInput
  extends Partial<CreateGarmentTypeInput> {}

export interface GarmentPriceLog {
  id: string;
  action: string;
  oldCustomerPrice: number | null;
  oldEmployeeRate: number | null;
  newCustomerPrice: number | null;
  newEmployeeRate: number | null;
  createdAt: Date | string;
  changedBy: {
    name: string;
    email?: string;
  };
  garmentType?: {
    name: string;
  };
}

export interface GarmentTypeAnalytics {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  totalPayout: number;
  avgActualPrice: number;
  topTailors: { name: string; count: number }[];
}

export interface GarmentTypeWithAnalytics extends GarmentType {
  marginAmount: number;
  marginPercentage: number;
  priceLogs: GarmentPriceLog[];
  rateCards: import('./rates').RateCard[];
  analytics: GarmentTypeAnalytics;
  workflowSteps: import('./orders').WorkflowStepTemplate[];
}

export interface SystemSettings {
  id: string;
  useTaskWorkflow: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateSystemSettingsInput {
  useTaskWorkflow?: boolean;
}
