import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            sizeNumber: string;
            fullName: string;
            phone: string;
            whatsapp: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    findAll(page: string, limit: string, search: string, isVip: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                sizeNumber: string;
                fullName: string;
                phone: string;
                whatsapp: string | null;
                email: string | null;
                address: string | null;
                city: string | null;
                notes: string | null;
                status: import(".prisma/client").$Enums.CustomerStatus;
                isVip: boolean;
                lifetimeValue: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
            }[];
            meta: {
                total: number;
                page: number;
                lastPage: number;
            };
        };
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            stats: {
                totalOrders: number;
                totalSpent: number;
            };
            measurements: ({
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    name: string;
                    sortOrder: number;
                    isActive: boolean;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                categoryId: string;
                values: import("@prisma/client/runtime/library").JsonValue;
            })[];
            id: string;
            sizeNumber: string;
            fullName: string;
            phone: string;
            whatsapp: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            sizeNumber: string;
            fullName: string;
            phone: string;
            whatsapp: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            sizeNumber: string;
            fullName: string;
            phone: string;
            whatsapp: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    getOrders(id: string, page: string, limit: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: ({
                items: {
                    id: string;
                    status: import(".prisma/client").$Enums.ItemStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    description: string | null;
                    dueDate: Date | null;
                    orderId: string;
                    garmentTypeId: string;
                    garmentTypeName: string;
                    employeeId: string | null;
                    quantity: number;
                    unitPrice: number;
                    employeeRate: number;
                    completedAt: Date | null;
                }[];
            } & {
                id: string;
                notes: string | null;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
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
            total: number;
        };
    }>;
    upsertMeasurement(id: string, dto: UpsertMeasurementDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            categoryId: string;
            values: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    toggleVip(id: string, isVip: boolean, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            sizeNumber: string;
            fullName: string;
            phone: string;
            whatsapp: string | null;
            email: string | null;
            address: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
}
