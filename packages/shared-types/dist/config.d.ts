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
export interface CreateMeasurementCategoryInput {
    name: string;
    sortOrder?: number;
    isActive?: boolean;
    fields?: Omit<MeasurementField, 'id' | 'dropdownOptions'> & {
        dropdownOptions?: string[];
    }[];
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
    createdAt: string;
}
export interface GarmentType {
    id: string;
    name: string;
    customerPrice: number;
    employeeRate: number;
    description?: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    resolvedCustomerPrice?: number;
    resolvedEmployeeRate?: number;
    isOverridden?: boolean;
    overridesCount: number;
    measurementCategories?: MeasurementCategory[];
}
export interface BranchPriceOverride {
    id: string;
    branchId: string;
    garmentTypeId: string;
    customerPrice: number | null;
    employeeRate: number | null;
    updatedAt: string;
    branch?: {
        id: string;
        name: string;
        code: string;
    };
}
export interface BranchPriceLog {
    id: string;
    action: 'UPDATE' | 'RESET';
    oldCustomerPrice: number | null;
    oldEmployeeRate: number | null;
    newCustomerPrice: number | null;
    newEmployeeRate: number | null;
    createdAt: string;
    changedBy: {
        name: string;
        email: string;
    };
    garmentType: {
        name: string;
    };
}
