"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_types_1 = require("@tbms/shared-types");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOrderNumber(branchId, tx) {
        const branch = await tx.branch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const year = new Date().getFullYear();
        const prefix = `ORD-${year}-${branch.code}-`;
        const lastOrder = await tx.order.findFirst({
            where: { branchId, orderNumber: { startsWith: prefix } },
            orderBy: { orderNumber: 'desc' }
        });
        let nextNumber = 1;
        if (lastOrder) {
            const parts = lastOrder.orderNumber.split('-');
            if (parts.length === 4) {
                nextNumber = parseInt(parts[3], 10) + 1;
            }
        }
        const paddedNumber = String(nextNumber).padStart(5, '0');
        return `${prefix}${paddedNumber}`;
    }
    async create(createOrderDto, branchId, createdById, userRole) {
        if (!createOrderDto.items || createOrderDto.items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        if ((createOrderDto.discountType || createOrderDto.discountValue) && ![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can apply discounts');
        }
        return this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({ where: { id: createOrderDto.customerId } });
            if (!customer || (branchId && customer.branchId !== branchId)) {
                throw new common_1.NotFoundException('Customer not found or does not belong to this branch');
            }
            const orderBranchId = branchId || customer.branchId;
            let subtotal = 0;
            const resolvedItems = [];
            for (const item of createOrderDto.items) {
                const type = await tx.garmentType.findUnique({
                    where: { id: item.garmentTypeId }
                });
                if (!type || !type.isActive) {
                    throw new common_1.BadRequestException(`Garment Type ${item.garmentTypeId} not found or inactive`);
                }
                const customerPrice = type.customerPrice;
                const employeeRate = type.employeeRate;
                subtotal += (customerPrice * item.quantity);
                resolvedItems.push({
                    garmentTypeId: type.id,
                    garmentTypeName: type.name,
                    employeeId: item.employeeId || null,
                    quantity: item.quantity,
                    unitPrice: customerPrice,
                    employeeRate: employeeRate,
                    description: item.description,
                    dueDate: item.dueDate ? new Date(item.dueDate) : null
                });
            }
            let discountAmount = 0;
            if (createOrderDto.discountType && createOrderDto.discountValue !== undefined) {
                if (createOrderDto.discountType === shared_types_1.DiscountType.FIXED) {
                    discountAmount = createOrderDto.discountValue;
                }
                else if (createOrderDto.discountType === shared_types_1.DiscountType.PERCENTAGE) {
                    discountAmount = Math.floor(subtotal * (createOrderDto.discountValue / 10000));
                }
            }
            if (discountAmount > subtotal) {
                throw new common_1.BadRequestException('Discount cannot exceed subtotal');
            }
            const totalAmount = subtotal - discountAmount;
            const initialPayment = createOrderDto.advancePayment || 0;
            if (initialPayment > totalAmount) {
                throw new common_1.BadRequestException('Advance payment cannot exceed total amount');
            }
            const balanceDue = totalAmount - initialPayment;
            const orderNumber = await this.generateOrderNumber(orderBranchId, tx);
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    branchId: orderBranchId,
                    customerId: customer.id,
                    dueDate: new Date(createOrderDto.dueDate),
                    subtotal: 0,
                    discountType: createOrderDto.discountType || null,
                    discountValue: createOrderDto.discountValue || 0,
                    discountAmount: 0,
                    totalAmount: 0,
                    totalPaid: initialPayment,
                    balanceDue: 0,
                    notes: createOrderDto.notes,
                    createdById,
                    items: {
                        create: resolvedItems
                    }
                },
                include: {
                    items: true,
                }
            });
            const settings = await tx.systemSettings.findUnique({ where: { id: 'default' } });
            if (settings?.useTaskWorkflow) {
                for (const item of newOrder.items) {
                    const templates = await tx.workflowStepTemplate.findMany({
                        where: { garmentTypeId: item.garmentTypeId, isActive: true },
                        orderBy: { sortOrder: 'asc' }
                    });
                    if (templates.length > 0) {
                        const tasksToCreate = templates.map((t) => ({
                            orderItemId: item.id,
                            stepTemplateId: t.id,
                            stepKey: t.stepKey,
                            stepName: t.stepName,
                            sortOrder: t.sortOrder,
                            status: 'PENDING',
                        }));
                        await tx.orderItemTask.createMany({
                            data: tasksToCreate
                        });
                    }
                }
            }
            const updatedOrder = await this.recalcOrderTotals(newOrder.id, tx);
            if (initialPayment > 0) {
                await tx.orderPayment.create({
                    data: {
                        orderId: updatedOrder.id,
                        amount: initialPayment,
                        receivedById: createdById,
                        note: 'Advance Payment at Order Creation'
                    }
                });
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { lifetimeValue: { increment: initialPayment } }
                });
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId: updatedOrder.id,
                    fromStatus: null,
                    toStatus: shared_types_1.OrderStatus.NEW,
                    changedById: createdById,
                    actor: 'USER',
                    note: 'Order Created'
                }
            });
            return updatedOrder;
        });
    }
    async recalcOrderTotals(orderId, tx) {
        const db = tx ?? this.prisma;
        const items = await db.orderItem.findMany({
            where: { orderId, status: { not: 'CANCELLED' }, deletedAt: null },
            select: { unitPrice: true, quantity: true }
        });
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const order = await db.order.findUnique({
            where: { id: orderId },
            select: { discountType: true, discountValue: true, totalPaid: true }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found for recalculation');
        let discountAmount = 0;
        if (order.discountType === shared_types_1.DiscountType.FIXED) {
            discountAmount = order.discountValue;
        }
        else if (order.discountType === shared_types_1.DiscountType.PERCENTAGE) {
            discountAmount = Math.floor(subtotal * (order.discountValue / 10000));
        }
        if (discountAmount > subtotal)
            discountAmount = subtotal;
        const totalAmount = subtotal - discountAmount;
        const balanceDue = Math.max(0, totalAmount - order.totalPaid);
        return db.order.update({
            where: { id: orderId },
            data: {
                subtotal,
                discountAmount,
                totalAmount,
                balanceDue
            },
            include: { items: true }
        });
    }
    async findAll(branchId, page = 1, limit = 20, filters = {}) {
        const skip = (page - 1) * limit;
        const whereClause = { deletedAt: null };
        if (branchId) {
            whereClause.branchId = branchId;
        }
        const orderBy = {};
        if (filters.sortBy) {
            orderBy[filters.sortBy] = filters.sortOrder || 'desc';
        }
        else {
            orderBy.orderDate = 'desc';
        }
        if (filters.status && Object.values(shared_types_1.OrderStatus).includes(filters.status)) {
            whereClause.status = filters.status;
        }
        if (filters.from || filters.to) {
            whereClause.orderDate = {};
            if (filters.from)
                whereClause.orderDate.gte = new Date(filters.from);
            if (filters.to)
                whereClause.orderDate.lte = new Date(filters.to);
        }
        if (filters.employeeId) {
            whereClause.items = { some: { employeeId: filters.employeeId } };
        }
        if (filters.search) {
            const search = filters.search.trim();
            whereClause.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customer: { fullName: { contains: search, mode: 'insensitive' } } },
                { customer: { phone: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy,
                include: {
                    customer: { select: { fullName: true, phone: true } }
                }
            }),
            this.prisma.order.count({ where: whereClause })
        ]);
        return { data, total };
    }
    async findOne(id, branchId) {
        const order = await this.prisma.order.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(branchId ? { branchId } : {})
            },
            include: {
                customer: true,
                items: {
                    where: { deletedAt: null },
                    include: { employee: { select: { fullName: true, id: true } } }
                },
                payments: {
                    orderBy: { paidAt: 'desc' }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async addPayment(id, branchId, addPaymentDto, receivedById) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            if (addPaymentDto.amount > order.balanceDue) {
                throw new common_1.BadRequestException('Payment amount exceeds balance due');
            }
            const newTotalPaid = order.totalPaid + addPaymentDto.amount;
            const newBalanceDue = order.balanceDue - addPaymentDto.amount;
            await tx.orderPayment.create({
                data: {
                    orderId: id,
                    amount: addPaymentDto.amount,
                    receivedById,
                    note: addPaymentDto.note
                }
            });
            await tx.order.update({
                where: { id },
                data: { totalPaid: newTotalPaid }
            });
            await tx.customer.update({
                where: { id: order.customerId },
                data: { lifetimeValue: { increment: addPaymentDto.amount } }
            });
            return this.recalcOrderTotals(id, tx);
        });
    }
    async updateStatus(id, branchId, dto, changedById) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            if (order.status === dto.status) {
                return order;
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    fromStatus: order.status,
                    toStatus: dto.status,
                    changedById,
                    actor: 'USER',
                    note: dto.note
                }
            });
            return tx.order.update({
                where: { id },
                data: { status: dto.status }
            });
        });
    }
    async generateShareLink(id, branchId) {
        const order = await this.prisma.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const token = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const pin = String(Math.floor(1000 + Math.random() * 9000));
        const updated = await this.prisma.order.update({
            where: { id },
            data: { shareToken: token, sharePin: pin },
            select: { id: true, orderNumber: true, shareToken: true, sharePin: true },
        });
        return updated;
    }
    async update(id, branchId, dto, userRole) {
        const order = await this.prisma.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const data = {};
        if (dto.dueDate)
            data.dueDate = new Date(dto.dueDate);
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        if (dto.discountType !== undefined || dto.discountValue !== undefined) {
            if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
                throw new common_1.ForbiddenException('Only admins can change order status directly');
            }
            if (dto.discountType !== undefined)
                data.discountType = dto.discountType;
            if (dto.discountValue !== undefined)
                data.discountValue = dto.discountValue;
        }
        await this.prisma.order.update({
            where: { id },
            data,
        });
        return this.recalcOrderTotals(id);
    }
    async updateItem(orderId, itemId, branchId, dto) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const item = await this.prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
        if (!item)
            throw new common_1.NotFoundException('Order item not found');
        const updated = await this.prisma.orderItem.update({
            where: { id: itemId },
            data: {
                status: dto.status || undefined,
                employeeId: dto.employeeId || undefined,
            },
        });
        if (dto.status) {
            await this.recalcOrderTotals(orderId);
        }
        return updated;
    }
    async removeItem(orderId, itemId, branchId) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        await this.prisma.orderItem.update({
            where: { id: itemId },
            data: { deletedAt: new Date(), status: 'CANCELLED' }
        });
        return this.recalcOrderTotals(orderId);
    }
    async cancelOrder(id, branchId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            await tx.orderItem.updateMany({
                where: { orderId: id, deletedAt: null },
                data: { status: 'CANCELLED', deletedAt: new Date() }
            });
            const updated = await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED', deletedAt: new Date() }
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    fromStatus: order.status,
                    toStatus: 'CANCELLED',
                    changedById: userId,
                    actor: 'USER',
                    note: 'Order soft-cancelled by user'
                }
            });
            return updated;
        });
    }
    async addItem(orderId, branchId, itemDto) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            const type = await tx.garmentType.findUnique({
                where: { id: itemDto.garmentTypeId }
            });
            if (!type || !type.isActive) {
                throw new common_1.BadRequestException('Garment type not found or inactive');
            }
            const customerPrice = type.customerPrice;
            const employeeRate = type.employeeRate;
            const orderItem = await tx.orderItem.create({
                data: {
                    orderId,
                    garmentTypeId: type.id,
                    garmentTypeName: type.name,
                    employeeId: itemDto.employeeId || null,
                    quantity: itemDto.quantity || 1,
                    unitPrice: customerPrice,
                    employeeRate: employeeRate,
                    description: itemDto.description,
                    dueDate: itemDto.dueDate ? new Date(itemDto.dueDate) : null
                }
            });
            const settings = await tx.systemSettings.findUnique({ where: { id: 'default' } });
            if (settings?.useTaskWorkflow) {
                const templates = await tx.workflowStepTemplate.findMany({
                    where: { garmentTypeId: orderItem.garmentTypeId, isActive: true },
                    orderBy: { sortOrder: 'asc' }
                });
                if (templates.length > 0) {
                    const tasksToCreate = templates.map((t) => ({
                        orderItemId: orderItem.id,
                        stepTemplateId: t.id,
                        stepKey: t.stepKey,
                        stepName: t.stepName,
                        sortOrder: t.sortOrder,
                        status: 'PENDING',
                    }));
                    await tx.orderItemTask.createMany({
                        data: tasksToCreate
                    });
                }
            }
            return this.recalcOrderTotals(orderId, tx);
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map