import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ConfigService } from './config.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    getBranches(): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        }[];
    }>;
    getSystemSettings(): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").SystemSettings;
    }>;
    updateSystemSettings(dto: UpdateSystemSettingsDto): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").SystemSettings;
    }>;
    getGarmentTypes(search?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            data: {
                marginAmount: number;
                marginPercentage: number;
                measurementCategories: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    deletedAt: Date | null;
                    sortOrder: number;
                }[];
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
                customerPrice: number;
                employeeRate: number;
                description: string | null;
                sortOrder: number;
            }[];
            total: number;
        };
    }>;
    getGarmentType(id: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").GarmentTypeWithAnalytics;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            customerPrice: number;
            employeeRate: number;
            description: string | null;
            sortOrder: number;
        };
    }>;
    updateGarmentType(id: string, dto: UpdateGarmentTypeDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            customerPrice: number;
            employeeRate: number;
            description: string | null;
            sortOrder: number;
        };
    }>;
    getGarmentPriceHistory(garmentTypeId: string): Promise<{
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
            garmentTypeId: string;
            action: string;
            changedById: string;
            oldCustomerPrice: number | null;
            oldEmployeeRate: number | null;
            newCustomerPrice: number | null;
            newEmployeeRate: number | null;
        })[];
    }>;
    updateGarmentWorkflowSteps(garmentTypeId: string, dto: UpdateGarmentWorkflowStepsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            deletedAt: Date | null;
            sortOrder: number;
            garmentTypeId: string;
            stepKey: string;
            stepName: string;
            isRequired: boolean;
        }[];
    }>;
    getMeasurementCategories(search?: string, page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            data: ({
                fields: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    sortOrder: number;
                    isRequired: boolean;
                    label: string;
                    fieldType: import(".prisma/client").$Enums.FieldType;
                    unit: string | null;
                    dropdownOptions: string[];
                    categoryId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            sortOrder: number;
        };
    }>;
    updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            sortOrder: number;
        };
    }>;
    addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            isRequired: boolean;
            label: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            unit: string | null;
            dropdownOptions: string[];
            categoryId: string;
        };
    }>;
    updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
            isRequired: boolean;
            label: string;
            fieldType: import(".prisma/client").$Enums.FieldType;
            unit: string | null;
            dropdownOptions: string[];
            categoryId: string;
        };
    }>;
    deleteMeasurementField(id: string): Promise<{
        success: boolean;
    }>;
    deleteMeasurementCategory(id: string): Promise<{
        success: boolean;
    }>;
}
