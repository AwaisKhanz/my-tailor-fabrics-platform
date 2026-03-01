import { PrismaService } from '../prisma/prisma.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { GarmentTypeWithAnalytics, SystemSettings } from '@tbms/shared-types';
export declare class ConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBranches(): Promise<{
        id: string;
        code: string;
        name: string;
        address: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
    }>;
    getGarmentType(id: string): Promise<GarmentTypeWithAnalytics>;
    createGarmentType(dto: CreateGarmentTypeDto): Promise<{
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
    }>;
    updateGarmentType(id: string, dto: UpdateGarmentTypeDto, userId: string): Promise<{
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
    }>;
    deleteGarmentType(id: string): Promise<{
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
    }>;
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
        action: string;
        garmentTypeId: string;
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
            updatedAt: Date;
            deletedAt: Date | null;
            sortOrder: number;
        })[];
        total: number;
    }>;
    createMeasurementCategory(dto: CreateMeasurementCategoryDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        categoryId: string;
        label: string;
        fieldType: import(".prisma/client").$Enums.FieldType;
        unit: string | null;
        isRequired: boolean;
        dropdownOptions: string[];
    }>;
    updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        categoryId: string;
        label: string;
        fieldType: import(".prisma/client").$Enums.FieldType;
        unit: string | null;
        isRequired: boolean;
        dropdownOptions: string[];
    }>;
    deleteMeasurementField(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        categoryId: string;
        label: string;
        fieldType: import(".prisma/client").$Enums.FieldType;
        unit: string | null;
        isRequired: boolean;
        dropdownOptions: string[];
    }>;
    deleteMeasurementCategory(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
}
