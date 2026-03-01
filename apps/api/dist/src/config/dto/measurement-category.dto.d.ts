import { FieldType } from '@tbms/shared-types';
export declare class CreateMeasurementCategoryDto {
    name: string;
    sortOrder?: number;
    isActive?: boolean;
    fields?: CreateMeasurementFieldDto[];
}
export declare class UpdateMeasurementCategoryDto {
    name?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class CreateMeasurementFieldDto {
    label: string;
    fieldType?: FieldType;
    unit?: string;
    isRequired?: boolean;
    sortOrder?: number;
    dropdownOptions?: string[];
}
export declare class UpdateMeasurementFieldDto {
    label?: string;
    fieldType?: FieldType;
    unit?: string;
    isRequired?: boolean;
    sortOrder?: number;
    dropdownOptions?: string[];
}
