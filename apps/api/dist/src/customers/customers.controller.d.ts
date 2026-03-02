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
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
            isVip: boolean;
            lifetimeValue: number;
        };
    }>;
    findAll(page: string, limit: string, search: string, isVip: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                phone: string;
                deletedAt: Date | null;
                email: string | null;
                branchId: string;
                fullName: string;
                city: string | null;
                status: import(".prisma/client").$Enums.CustomerStatus;
                notes: string | null;
                sizeNumber: string;
                whatsapp: string | null;
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
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    deletedAt: Date | null;
                    sortOrder: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                values: import("@prisma/client/runtime/library").JsonValue;
                categoryId: string;
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
            isVip: boolean;
            lifetimeValue: number;
        };
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
            isVip: boolean;
            lifetimeValue: number;
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
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
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    employeeId: string | null;
                    employeeRate: number;
                    description: string | null;
                    garmentTypeId: string;
                    status: import(".prisma/client").$Enums.ItemStatus;
                    dueDate: Date | null;
                    garmentTypeName: string;
                    quantity: number;
                    unitPrice: number;
                    completedAt: Date | null;
                    fabricSource: import(".prisma/client").$Enums.FabricSource;
                    pieceNo: number;
                    designTypeId: string | null;
                    orderId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
                createdById: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                notes: string | null;
                orderNumber: string;
                shareToken: string | null;
                customerId: string;
                orderDate: Date;
                dueDate: Date;
                subtotal: number;
                discountType: import(".prisma/client").$Enums.DiscountType | null;
                discountValue: number;
                discountAmount: number;
                totalAmount: number;
                totalPaid: number;
                balanceDue: number;
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
            values: import("@prisma/client/runtime/library").JsonValue;
            categoryId: string;
        };
    }>;
    toggleVip(id: string, isVip: boolean, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
            isVip: boolean;
            lifetimeValue: number;
        };
    }>;
}
