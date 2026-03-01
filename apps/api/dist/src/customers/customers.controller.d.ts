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
        };
    }>;
    findAll(page: string, limit: string, search: string, isVip: string, req: AuthenticatedRequest): Promise<{
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
        success: boolean;
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
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    sortOrder: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                values: import("@prisma/client/runtime/library").JsonValue;
                customerId: string;
                categoryId: string;
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
        };
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
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
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
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
        };
    }>;
    getOrders(id: string, page: string, limit: string, req: AuthenticatedRequest): Promise<{
        data: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
        success: boolean;
    }>;
    upsertMeasurement(id: string, dto: UpsertMeasurementDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            values: import("@prisma/client/runtime/library").JsonValue;
            customerId: string;
            categoryId: string;
        };
    }>;
    toggleVip(id: string, isVip: boolean, req: AuthenticatedRequest): Promise<{
        success: boolean;
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
        };
    }>;
}
