import { PrismaService } from '../prisma/prisma.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';
import { GarmentTypeWithAnalytics, SystemSettings } from '@tbms/shared-types';
export declare class ConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBranches(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        deletedAt: Date | null;
    }[]>;
    getSystemSettings(): Promise<SystemSettings>;
    updateSystemSettings(dto: UpdateSystemSettingsDto): Promise<SystemSettings>;
    getGarmentTypes(options?: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    }>;
    getGarmentType(id: string): Promise<GarmentTypeWithAnalytics>;
    createGarmentType(dto: CreateGarmentTypeDto): Promise<{
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
    }>;
    updateGarmentType(id: string, dto: UpdateGarmentTypeDto, userId: string): Promise<{
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
    }>;
    deleteGarmentType(id: string): Promise<{
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
    }>;
    updateGarmentWorkflowSteps(garmentTypeId: string, dto: UpdateGarmentWorkflowStepsDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        deletedAt: Date | null;
        sortOrder: number;
        garmentTypeId: string;
        stepKey: string;
        stepName: string;
        isRequired: boolean;
    }[]>;
    getGarmentStats(): Promise<{
        totalCount: number;
        avgRetailPrice: number;
        activeProduction: number;
    }>;
    getGarmentPriceHistory(garmentTypeId: string): Promise<({
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
    })[]>;
    getMeasurementCategories(options?: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    }>;
    createMeasurementCategory(dto: CreateMeasurementCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto): Promise<{
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
    }>;
    updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto): Promise<{
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
    }>;
    deleteMeasurementField(id: string): Promise<{
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
    }>;
    deleteMeasurementCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
}
