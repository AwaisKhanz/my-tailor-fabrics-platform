import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { OrdersService } from './orders.service';
import { ReceiptService } from './receipt.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    private readonly receiptService;
    constructor(ordersService: OrdersService, receiptService: ReceiptService);
    create(createOrderDto: CreateOrderDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    findAll(page: string, limit: string, status: string, from: string, to: string, employeeId: string, sortBy: string, sortOrder: 'asc' | 'desc', req: AuthenticatedRequest): Promise<{
        data: ({
            customer: {
                phone: string;
                fullName: string;
            };
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
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            customer: {
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
            payments: {
                id: string;
                deletedAt: Date | null;
                orderId: string;
                amount: number;
                note: string | null;
                paidAt: Date;
                receivedById: string;
            }[];
            items: ({
                employee: {
                    id: string;
                    fullName: string;
                } | null;
            } & {
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
            })[];
            statusHistory: {
                id: string;
                createdAt: Date;
                orderId: string;
                note: string | null;
                fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
                toStatus: import(".prisma/client").$Enums.OrderStatus;
                changedById: string | null;
                actor: string;
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
        };
    }>;
    update(id: string, dto: {
        dueDate?: string;
        notes?: string;
        discountType?: 'PERCENTAGE' | 'FIXED';
        discountValue?: number;
        status?: string;
        employeeId?: string;
    }, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    cancel(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    addItem(id: string, dto: {
        garmentTypeId: string;
        employeeId?: string;
        quantity?: number;
        description?: string;
        dueDate?: string;
    }, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateItem(id: string, itemId: string, dto: {
        status?: string;
        employeeId?: string;
    }, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    removeItem(id: string, itemId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    addPayment(id: string, addPaymentDto: AddPaymentDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    shareOrder(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            sharePin: string | null;
        };
    }>;
}
