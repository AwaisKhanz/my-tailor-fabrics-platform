export declare class CreateGarmentTypeDto {
    name: string;
    customerPrice: number;
    employeeRate: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    measurementCategoryIds?: string[];
}
export declare class UpdateGarmentTypeDto {
    name?: string;
    customerPrice?: number;
    employeeRate?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    measurementCategoryIds?: string[];
}
export declare class SetBranchPriceDto {
    customerPrice?: number;
    employeeRate?: number;
}
