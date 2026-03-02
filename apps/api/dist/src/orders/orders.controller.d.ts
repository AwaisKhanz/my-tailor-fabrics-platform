import * as express from 'express';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { OrdersService } from './orders.service';
import { ReceiptService } from './receipt.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                amount: number;
                paidAt: Date;
                receivedById: string;
                note: string | null;
                orderId: string;
            }[];
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
                            label: string;
                            fieldType: import(".prisma/client").$Enums.FieldType;
                            unit: string | null;
                            dropdownOptions: string[];
                            categoryId: string;
                        }[];
                    } & {
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
            } & {
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
            items: ({
                employee: {
                    id: string;
                    fullName: string;
                } | null;
                tasks: ({
                    designType: {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
                        isActive: boolean;
                        deletedAt: Date | null;
                        branchId: string | null;
                        sortOrder: number;
                        garmentTypeId: string | null;
                        defaultPrice: number;
                        defaultRate: number;
                    } | null;
                    assignedEmployee: {
                        id: string;
                        fullName: string;
                    } | null;
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    sortOrder: number;
                    stepKey: string;
                    stepName: string;
                    stepTemplateId: string | null;
                    status: import(".prisma/client").$Enums.TaskStatus;
                    notes: string | null;
                    completedAt: Date | null;
                    designTypeId: string | null;
                    assignedEmployeeId: string | null;
                    rateOverride: number | null;
                    rateSnapshot: number | null;
                    orderItemId: string;
                    startedAt: Date | null;
                    rateCardId: string | null;
                })[];
                addons: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    deletedAt: Date | null;
                    note: string | null;
                    type: import(".prisma/client").$Enums.AddonType;
                    price: number;
                    cost: number | null;
                    orderItemId: string;
                }[];
                designType: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    isActive: boolean;
                    deletedAt: Date | null;
                    branchId: string | null;
                    sortOrder: number;
                    garmentTypeId: string | null;
                    defaultPrice: number;
                    defaultRate: number;
                } | null;
            } & {
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
            })[];
            statusHistory: ({
                order: {
                    orderNumber: string;
                };
            } & {
                id: string;
                createdAt: Date;
                note: string | null;
                orderId: string;
                fromStatus: import(".prisma/client").$Enums.OrderStatus | null;
                toStatus: import(".prisma/client").$Enums.OrderStatus;
                changedById: string | null;
                actor: string;
            })[];
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
        };
    }>;
    update(id: string, dto: UpdateOrderDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    addItem(id: string, dto: OrderItemDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateItem(id: string, itemId: string, dto: {
        status?: string;
        employeeId?: string;
    }, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getReceipt(id: string, req: AuthenticatedRequest, res: express.Response): Promise<void>;
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
