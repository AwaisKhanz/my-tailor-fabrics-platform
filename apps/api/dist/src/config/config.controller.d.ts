import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ConfigService } from './config.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto, SetBranchPriceDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    getBranches(): Promise<{
        success: boolean;
        data: {
            id: string;
            code: string;
            name: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
    }>;
    getGarmentTypes(req: AuthenticatedRequest, search?: string, page?: string, limit?: string, branchIdQuery?: string): Promise<{
        success: boolean;
        data: {
            data: {
                resolvedCustomerPrice: number;
                resolvedEmployeeRate: number;
                isOverridden: boolean;
                overridesCount: number;
                marginAmount: number;
                marginPercentage: number;
                priceOffset: number;
                branchOverrides: {
                    id: string;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    branchId: string;
                    customerPrice: number | null;
                    employeeRate: number | null;
                    garmentTypeId: string;
                }[];
                measurementCategories: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    deletedAt: Date | null;
                    sortOrder: number;
                }[];
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                customerPrice: number;
                employeeRate: number;
                description: string | null;
                sortOrder: number;
            }[];
            total: number;
        };
    }>;
    getGarmentType(id: string, req: AuthenticatedRequest, branchIdQuery?: string): Promise<{
        success: boolean;
        data: {
            resolvedCustomerPrice: number;
            resolvedEmployeeRate: number;
            isOverridden: boolean;
            overridesCount: number;
            marginAmount: number;
            marginPercentage: number;
            priceOffset: number;
            branchOverrides: {
                id: string;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
                customerPrice: number | null;
                employeeRate: number | null;
                garmentTypeId: string;
            }[];
            measurementCategories: ({
                fields: {
                    id: string;
                    deletedAt: Date | null;
                    sortOrder: number;
                    categoryId: string;
                    label: string;
                    fieldType: import(".prisma/client").$Enums.FieldType;
                    unit: string | null;
                    isRequired: boolean;
                    dropdownOptions: string[];
                }[];
            } & {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                deletedAt: Date | null;
                sortOrder: number;
            })[];
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            customerPrice: number;
            employeeRate: number;
            description: string | null;
            sortOrder: number;
        };
    }>;
    getGarmentStats(): Promise<{
        success: boolean;
        data: {
            totalCount: number;
            avgRetailPrice: number;
            activeProduction: number;
        };
    }>;
    createGarmentType(dto: CreateGarmentTypeDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            customerPrice: number;
            employeeRate: number;
            description: string | null;
            sortOrder: number;
        };
    }>;
    updateGarmentType(id: string, dto: UpdateGarmentTypeDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            customerPrice: number;
            employeeRate: number;
            description: string | null;
            sortOrder: number;
        };
    }>;
    getBranchPrices(garmentTypeId: string): Promise<{
        success: boolean;
        data: ({
            branch: {
                id: string;
                code: string;
                name: string;
                address: string | null;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            customerPrice: number | null;
            employeeRate: number | null;
            garmentTypeId: string;
        })[];
    }>;
    setBranchPrice(garmentTypeId: string, body: SetBranchPriceDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            customerPrice: number | null;
            employeeRate: number | null;
            garmentTypeId: string;
        };
    }>;
    deleteBranchPrice(garmentTypeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    getBranchPriceHistory(garmentTypeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: ({
            garmentType: {
                name: string;
            };
            changedBy: {
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            branchId: string;
            action: string;
            garmentTypeId: string;
            changedById: string;
            oldCustomerPrice: number | null;
            oldEmployeeRate: number | null;
            newCustomerPrice: number | null;
            newEmployeeRate: number | null;
        })[];
    }>;
    getMeasurementCategories(search?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            data: ({
                fields: {
                    id: string;
                    deletedAt: Date | null;
                    sortOrder: number;
                    categoryId: string;
                    label: string;
                    fieldType: import(".prisma/client").$Enums.FieldType;
                    unit: string | null;
                    isRequired: boolean;
                    dropdownOptions: string[];
                }[];
            } & {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                deletedAt: Date | null;
                sortOrder: number;
            })[];
            total: number;
        };
    }>;
    createMeasurementCategory(dto: CreateMeasurementCategoryDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
        };
    }>;
    updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
        };
    }>;
    addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto): Promise<{
        success: boolean;
        data: {
            id: string;
            deletedAt: Date | null;
            sortOrder: number;
            categoryId: string;
            label: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            unit: string | null;
            isRequired: boolean;
            dropdownOptions: string[];
        };
    }>;
    updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto): Promise<{
        success: boolean;
        data: {
            id: string;
            deletedAt: Date | null;
            sortOrder: number;
            categoryId: string;
            label: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            unit: string | null;
            isRequired: boolean;
            dropdownOptions: string[];
        };
    }>;
    deleteMeasurementField(id: string): Promise<{
        success: boolean;
    }>;
    deleteMeasurementCategory(id: string): Promise<{
        success: boolean;
    }>;
}
