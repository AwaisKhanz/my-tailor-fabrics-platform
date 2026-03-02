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
            email: string | null;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        success: boolean;
        data: {
            data: {
                id: string;
                email: string | null;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                address: string | null;
                phone: string;
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
                customerId: string;
                categoryId: string;
                values: import("@prisma/client/runtime/library").JsonValue;
            })[];
            id: string;
            email: string | null;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
            email: string | null;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
            email: string | null;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        success: boolean;
        data: {
            data: ({
                items: {
                    id: string;
                    employeeId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    status: import(".prisma/client").$Enums.ItemStatus;
                    description: string | null;
                    dueDate: Date | null;
                    orderId: string;
                    garmentTypeId: string;
                    garmentTypeName: string;
                    pieceNo: number;
                    quantity: number;
                    unitPrice: number;
                    employeeRate: number;
                    fabricSource: import(".prisma/client").$Enums.FabricSource;
                    completedAt: Date | null;
                }[];
            } & {
                id: string;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
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
            email: string | null;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
