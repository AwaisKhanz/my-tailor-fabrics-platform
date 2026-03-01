import { PrismaService } from '../prisma/prisma.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto, SetBranchPriceDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
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
    resolvePrices(garmentTypeId: string, branchId: string): Promise<{
        customerPrice: number;
        employeeRate: number;
        garmentTypeName: string;
    }>;
    getGarmentTypes(options?: {
        branchId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    }>;
    getGarmentType(id: string, branchId?: string): Promise<{
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
    }>;
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
    updateGarmentType(id: string, dto: UpdateGarmentTypeDto): Promise<{
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
    getBranchPrices(garmentTypeId: string): Promise<({
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
    })[]>;
    setBranchPrice(garmentTypeId: string, branchId: string, dto: SetBranchPriceDto, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        customerPrice: number | null;
        employeeRate: number | null;
        garmentTypeId: string;
    }>;
    deleteBranchPrice(garmentTypeId: string, branchId: string, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        customerPrice: number | null;
        employeeRate: number | null;
        garmentTypeId: string;
    } | undefined>;
    getBranchPriceHistory(garmentTypeId: string, branchId: string): Promise<({
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
    })[]>;
    getMeasurementCategories(options?: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
    }>;
    createMeasurementCategory(dto: CreateMeasurementCategoryDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
    }>;
    addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto): Promise<{
        id: string;
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
        deletedAt: Date | null;
        sortOrder: number;
    }>;
}
