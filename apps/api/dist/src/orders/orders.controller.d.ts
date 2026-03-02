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
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                employeeRate: number;
                description: string | null;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    findAll(page: string, limit: string, status: string, from: string, to: string, employeeId: string, search: string, sortBy: string, sortOrder: 'asc' | 'desc', req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: ({
                customer: {
                    fullName: string;
                    phone: string;
                };
            } & {
                id: string;
                orderNumber: string;
                shareToken: string | null;
                branchId: string;
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
                notes: string | null;
                status: import(".prisma/client").$Enums.OrderStatus;
                createdById: string;
                sharePin: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            })[];
            total: number;
        };
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            customer: {
                id: string;
                branchId: string;
                notes: string | null;
                status: import(".prisma/client").$Enums.CustomerStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                sizeNumber: string;
                fullName: string;
                phone: string;
                whatsapp: string | null;
                email: string | null;
                address: string | null;
                city: string | null;
                isVip: boolean;
                lifetimeValue: number;
            };
            items: ({
                employee: {
                    id: string;
                    fullName: string;
                } | null;
            } & {
                id: string;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                employeeRate: number;
                description: string | null;
                completedAt: Date | null;
            })[];
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                paidAt: Date;
                amount: number;
                receivedById: string;
                note: string | null;
            }[];
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
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
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
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                employeeRate: number;
                description: string | null;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    cancel(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
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
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                employeeRate: number;
                description: string | null;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    updateItem(id: string, itemId: string, dto: {
        status?: string;
        employeeId?: string;
    }, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            dueDate: Date | null;
            status: import(".prisma/client").$Enums.ItemStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderId: string;
            garmentTypeId: string;
            garmentTypeName: string;
            employeeId: string | null;
            quantity: number;
            unitPrice: number;
            employeeRate: number;
            description: string | null;
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
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderId: string;
                garmentTypeId: string;
                garmentTypeName: string;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                employeeRate: number;
                description: string | null;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            orderNumber: string;
            shareToken: string | null;
            branchId: string;
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
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdById: string;
            sharePin: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
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
