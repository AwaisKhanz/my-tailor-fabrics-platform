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
                garmentTypeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                employeeRate: number;
                description: string | null;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                orderId: string;
                garmentTypeName: string;
                pieceNo: number;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                fabricSource: import(".prisma/client").$Enums.FabricSource;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
            shareToken: string | null;
            sharePin: string | null;
        };
    }>;
    findAll(page: string, limit: string, status: string, from: string, to: string, employeeId: string, search: string, sortBy: string, sortOrder: 'asc' | 'desc', req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: ({
                customer: {
                    phone: string;
                    fullName: string;
                };
            } & {
                id: string;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                orderNumber: string;
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
                shareToken: string | null;
                sharePin: string | null;
            })[];
            total: number;
        };
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            customer: {
                measurements: ({
                    category: {
                        fields: {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            deletedAt: Date | null;
                            sortOrder: number;
                            isRequired: boolean;
                            categoryId: string;
                            label: string;
                            fieldType: import(".prisma/client").$Enums.FieldType;
                            unit: string | null;
                            dropdownOptions: string[];
                        }[];
                    } & {
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
                    values: import("@prisma/client/runtime/library").JsonValue;
                    customerId: string;
                    categoryId: string;
                })[];
            } & {
                id: string;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                address: string | null;
                phone: string;
                notes: string | null;
                status: import(".prisma/client").$Enums.CustomerStatus;
                sizeNumber: string;
                fullName: string;
                whatsapp: string | null;
                email: string | null;
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
                garmentTypeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                employeeRate: number;
                description: string | null;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                orderId: string;
                garmentTypeName: string;
                pieceNo: number;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                fabricSource: import(".prisma/client").$Enums.FabricSource;
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
            statusHistory: ({
                order: {
                    orderNumber: string;
                };
            } & {
                id: string;
                createdAt: Date;
                orderId: string;
                note: string | null;
                fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
                toStatus: import(".prisma/client").$Enums.OrderStatus;
                changedById: string | null;
                actor: string;
            })[];
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
                garmentTypeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                employeeRate: number;
                description: string | null;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                orderId: string;
                garmentTypeName: string;
                pieceNo: number;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                fabricSource: import(".prisma/client").$Enums.FabricSource;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
            shareToken: string | null;
            sharePin: string | null;
        };
    }>;
    cancel(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
                garmentTypeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                employeeRate: number;
                description: string | null;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                orderId: string;
                garmentTypeName: string;
                pieceNo: number;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                fabricSource: import(".prisma/client").$Enums.FabricSource;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
            garmentTypeId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeRate: number;
            description: string | null;
            dueDate: Date | null;
            status: import(".prisma/client").$Enums.ItemStatus;
            orderId: string;
            garmentTypeName: string;
            pieceNo: number;
            employeeId: string | null;
            quantity: number;
            unitPrice: number;
            fabricSource: import(".prisma/client").$Enums.FabricSource;
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
                garmentTypeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                employeeRate: number;
                description: string | null;
                dueDate: Date | null;
                status: import(".prisma/client").$Enums.ItemStatus;
                orderId: string;
                garmentTypeName: string;
                pieceNo: number;
                employeeId: string | null;
                quantity: number;
                unitPrice: number;
                fabricSource: import(".prisma/client").$Enums.FabricSource;
                completedAt: Date | null;
            }[];
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
            shareToken: string | null;
            sharePin: string | null;
        };
    }>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            orderNumber: string;
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
            shareToken: string | null;
            sharePin: string | null;
        };
    }>;
    getReceipt(id: string, req: AuthenticatedRequest, res: any): Promise<void>;
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
