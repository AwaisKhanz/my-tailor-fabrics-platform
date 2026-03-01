import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { SearchService } from '../search/search.service';
export declare class CustomersService {
    private prisma;
    private searchService;
    constructor(prisma: PrismaService, searchService: SearchService);
    private generateSizeNumber;
    create(createCustomerDto: CreateCustomerDto, branchId: string): Promise<{
        id: string;
        address: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string | null;
        branchId: string;
        sizeNumber: string;
        fullName: string;
        whatsapp: string | null;
        city: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        isVip: boolean;
        lifetimeValue: number;
    }>;
    findAll(branchId: string, page?: number, limit?: number, search?: string, isVip?: boolean): Promise<{
        data: {
            id: string;
            address: string | null;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            sizeNumber: string;
            fullName: string;
            whatsapp: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string, branchId: string): Promise<{
        stats: {
            totalOrders: number;
            totalSpent: number;
        };
        measurements: ({
            category: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                deletedAt: Date | null;
                sortOrder: number;
            };
        } & {
            id: string;
            updatedAt: Date;
            values: Prisma.JsonValue;
            categoryId: string;
            customerId: string;
        })[];
        id: string;
        address: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string | null;
        branchId: string;
        sizeNumber: string;
        fullName: string;
        whatsapp: string | null;
        city: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        isVip: boolean;
        lifetimeValue: number;
    }>;
    update(id: string, branchId: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        id: string;
        address: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string | null;
        branchId: string;
        sizeNumber: string;
        fullName: string;
        whatsapp: string | null;
        city: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        isVip: boolean;
        lifetimeValue: number;
    }>;
    remove(id: string, branchId: string): Promise<{
        id: string;
        address: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string | null;
        branchId: string;
        sizeNumber: string;
        fullName: string;
        whatsapp: string | null;
        city: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        isVip: boolean;
        lifetimeValue: number;
    }>;
    getOrders(id: string, branchId: string, page?: number, limit?: number): Promise<{
        data: ({
            items: {
                id: string;
                deletedAt: Date | null;
                employeeId: string | null;
                employeeRate: number;
                description: string | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                dueDate: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                quantity: number;
                unitPrice: number;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            customerId: string;
            totalPaid: number;
            subtotal: number;
            discountValue: number;
            discountAmount: number;
            totalAmount: number;
            balanceDue: number;
            orderNumber: string;
            orderDate: Date;
            dueDate: Date;
            discountType: import(".prisma/client").$Enums.DiscountType | null;
            createdById: string;
            shareToken: string | null;
            sharePin: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    upsertMeasurement(id: string, branchId: string, dto: UpsertMeasurementDto): Promise<{
        id: string;
        updatedAt: Date;
        values: Prisma.JsonValue;
        categoryId: string;
        customerId: string;
    }>;
    toggleVip(id: string, branchId: string, isVip: boolean): Promise<{
        id: string;
        address: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string | null;
        branchId: string;
        sizeNumber: string;
        fullName: string;
        whatsapp: string | null;
        city: string | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.CustomerStatus;
        isVip: boolean;
        lifetimeValue: number;
    }>;
}
