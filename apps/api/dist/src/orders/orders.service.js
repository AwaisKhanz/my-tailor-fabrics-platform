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
const client_1 = require("@prisma/client");
const shared_types_1 = require("@tbms/shared-types");
const rates_service_1 = require("../rates/rates.service");
const money_1 = require("./money");
let OrdersService = class OrdersService {
    prisma;
    ratesService;
    constructor(prisma, ratesService) {
        this.prisma = prisma;
        this.ratesService = ratesService;
    }
    async generateOrderNumber(branchId, tx) {
        const branch = await tx.branch.findUnique({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const year = new Date().getFullYear();
        const prefix = `ORD-${year}-${branch.code}-`;
        const lastOrder = await tx.order.findFirst({
            where: { branchId, orderNumber: { startsWith: prefix } },
            orderBy: { orderNumber: 'desc' },
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
        if ((createOrderDto.discountType || createOrderDto.discountValue) &&
            ![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can apply discounts');
        }
        return this.prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({
                where: { id: createOrderDto.customerId },
            });
            if (!customer || (branchId && customer.branchId !== branchId)) {
                throw new common_1.NotFoundException('Customer not found or does not belong to this branch');
            }
            const orderBranchId = branchId || customer.branchId;
            let subtotal = 0;
            const resolvedItems = [];
            const pieceMap = {};
            for (const item of createOrderDto.items) {
                const type = await tx.garmentType.findUnique({
                    where: { id: item.garmentTypeId },
                });
                if (!type || !type.isActive) {
                    throw new common_1.BadRequestException(`Garment Type ${item.garmentTypeId} not found or inactive`);
                }
                const customerPrice = item.unitPrice !== undefined && item.unitPrice !== 0 ? item.unitPrice : type.customerPrice;
                const employeeRate = item.employeeRate !== undefined && item.employeeRate !== 0 ? item.employeeRate : type.employeeRate;
                for (let i = 0; i < item.quantity; i++) {
                    pieceMap[item.garmentTypeId] =
                        (pieceMap[item.garmentTypeId] || 0) + 1;
                    const currentPieceNo = pieceMap[item.garmentTypeId];
                    const designType = item.designTypeId
                        ? await tx.designType.findUnique({
                            where: { id: item.designTypeId },
                        })
                        : null;
                    const addonsPrice = (item.addons || []).reduce((sum, a) => sum + (a.price || 0), 0);
                    subtotal += customerPrice + (designType?.defaultPrice || 0) + addonsPrice;
                    resolvedItems.push({
                        garmentTypeId: type.id,
                        garmentTypeName: type.name,
                        pieceNo: currentPieceNo,
                        employeeId: item.employeeId || null,
                        quantity: 1,
                        unitPrice: customerPrice,
                        employeeRate: employeeRate,
                        description: item.description,
                        fabricSource: item.fabricSource || 'SHOP',
                        dueDate: item.dueDate ? new Date(item.dueDate) : null,
                        designTypeId: item.designTypeId || null,
                        addons: item.addons || [],
                    });
                }
            }
            if (createOrderDto.discountType &&
                createOrderDto.discountValue !== undefined) {
                const rawDiscountAmount = createOrderDto.discountType === shared_types_1.DiscountType.FIXED
                    ? createOrderDto.discountValue
                    : Math.floor(subtotal * (createOrderDto.discountValue / 10000));
                if (rawDiscountAmount > subtotal) {
                    throw new common_1.BadRequestException('Discount cannot exceed subtotal');
                }
            }
            const discountAmount = (0, money_1.calculateDiscountAmount)(subtotal, createOrderDto.discountType, createOrderDto.discountValue ?? 0);
            const totalAmount = subtotal - discountAmount;
            const initialPayment = createOrderDto.advancePayment || 0;
            if (initialPayment > totalAmount) {
                throw new common_1.BadRequestException('Advance payment cannot exceed total amount');
            }
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
                        create: resolvedItems.map((item) => ({
                            pieceNo: item.pieceNo,
                            employeeId: item.employeeId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            employeeRate: item.employeeRate,
                            description: item.description,
                            fabricSource: item.fabricSource ?? client_1.FabricSource.SHOP,
                            dueDate: item.dueDate,
                            garmentTypeName: item.garmentTypeName,
                            garmentType: { connect: { id: item.garmentTypeId } },
                            designTypeId: item.designTypeId,
                            addons: {
                                create: (item.addons || []).map((a) => ({
                                    type: a.type,
                                    name: a.name,
                                    price: a.price,
                                    cost: a.cost,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });
            const settings = await tx.systemSettings.findUnique({
                where: { id: 'default' },
            });
            if (settings?.useTaskWorkflow) {
                for (const item of newOrder.items) {
                    await this.generateTasksForItem(item.id, item.garmentTypeId, orderBranchId, tx);
                }
            }
            const updatedOrder = await this.recalcOrderTotals(newOrder.id, tx);
            if (initialPayment > 0) {
                await tx.orderPayment.create({
                    data: {
                        orderId: updatedOrder.id,
                        amount: initialPayment,
                        receivedById: createdById,
                        note: 'Advance Payment at Order Creation',
                    },
                });
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { lifetimeValue: { increment: initialPayment } },
                });
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId: updatedOrder.id,
                    fromStatus: null,
                    toStatus: shared_types_1.OrderStatus.NEW,
                    changedById: createdById,
                    actor: 'USER',
                    note: 'Order Created',
                },
            });
            return updatedOrder;
        });
    }
    async recalcOrderTotals(orderId, tx) {
        const db = tx ?? this.prisma;
        const items = await db.orderItem.findMany({
            where: { orderId, status: { not: 'CANCELLED' }, deletedAt: null },
            include: {
                addons: { where: { deletedAt: null } },
                designType: true,
            },
        });
        const subtotal = items.reduce((sum, item) => {
            const itemBase = item.unitPrice * item.quantity;
            const designPrice = (item.designType?.defaultPrice || 0) * item.quantity;
            const addonsTotal = item.addons.reduce((aSum, addon) => aSum + (addon.price || 0), 0);
            return sum + itemBase + designPrice + addonsTotal;
        }, 0);
        const order = await db.order.findUnique({
            where: { id: orderId },
            select: { discountType: true, discountValue: true, totalPaid: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found for recalculation');
        const { discountAmount, totalAmount, balanceDue } = (0, money_1.calculateOrderTotals)(subtotal, order.totalPaid, order.discountType, order.discountValue);
        return db.order.update({
            where: { id: orderId },
            data: {
                subtotal,
                discountAmount,
                totalAmount,
                balanceDue,
            },
            include: { items: true },
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
            const sortOrder = filters.sortOrder || 'desc';
            switch (filters.sortBy) {
                case 'orderNumber':
                    orderBy.orderNumber = sortOrder;
                    break;
                case 'orderDate':
                    orderBy.orderDate = sortOrder;
                    break;
                case 'dueDate':
                    orderBy.dueDate = sortOrder;
                    break;
                case 'totalAmount':
                    orderBy.totalAmount = sortOrder;
                    break;
                case 'status':
                    orderBy.status = sortOrder;
                    break;
                case 'customer':
                    orderBy.customer = { fullName: sortOrder };
                    break;
                default:
                    orderBy.orderDate = 'desc';
            }
        }
        else {
            orderBy.orderDate = 'desc';
        }
        if (filters.status &&
            Object.values(shared_types_1.OrderStatus).includes(filters.status)) {
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
                    customer: { select: { fullName: true, phone: true } },
                },
            }),
            this.prisma.order.count({ where: whereClause }),
        ]);
        return { data, total };
    }
    async findOne(id, branchId) {
        const order = await this.prisma.order.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
            include: {
                customer: {
                    include: {
                        measurements: {
                            include: {
                                category: {
                                    include: {
                                        fields: true,
                                    },
                                },
                            },
                        },
                    },
                },
                items: {
                    where: { deletedAt: null },
                    orderBy: { pieceNo: 'asc' },
                    include: {
                        employee: { select: { fullName: true, id: true } },
                        designType: true,
                        addons: { where: { deletedAt: null } },
                        tasks: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                designType: true,
                                assignedEmployee: { select: { fullName: true, id: true } },
                            },
                        },
                    },
                },
                payments: {
                    orderBy: { paidAt: 'desc' },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        order: { select: { orderNumber: true } },
                    },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async addPayment(id, branchId, addPaymentDto, receivedById) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
            });
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
                    note: addPaymentDto.note,
                },
            });
            await tx.order.update({
                where: { id },
                data: { totalPaid: newTotalPaid },
            });
            await tx.customer.update({
                where: { id: order.customerId },
                data: { lifetimeValue: { increment: addPaymentDto.amount } },
            });
            return this.recalcOrderTotals(id, tx);
        });
    }
    async updateStatus(id, branchId, dto, changedById) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
            });
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
                    note: dto.note,
                },
            });
            return tx.order.update({
                where: { id },
                data: { status: dto.status },
            });
        });
    }
    async generateShareLink(id, branchId) {
        const order = await this.prisma.order.findFirst({
            where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
        });
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
    async getPublicOrderStatus(token, pin) {
        const order = await this.prisma.order.findFirst({
            where: {
                shareToken: token,
                sharePin: pin,
                deletedAt: null,
            },
            select: {
                id: true,
                orderNumber: true,
                dueDate: true,
                totalAmount: true,
                balanceDue: true,
                status: true,
                customer: {
                    select: {
                        fullName: true,
                    },
                },
                items: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: {
                        pieceNo: 'asc',
                    },
                    select: {
                        id: true,
                        garmentTypeName: true,
                        quantity: true,
                        unitPrice: true,
                        description: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Invalid tracking link or PIN');
        }
        return order;
    }
    async update(id, branchId, dto, userRole) {
        return await this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
                include: { items: true },
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            const data = {};
            if (dto.dueDate)
                data.dueDate = new Date(dto.dueDate);
            if (dto.notes !== undefined)
                data.notes = dto.notes;
            if (dto.discountType !== undefined || dto.discountValue !== undefined) {
                if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
                    throw new common_1.ForbiddenException('Only admins can change financial details');
                }
                if (dto.discountType !== undefined)
                    data.discountType = dto.discountType;
                if (dto.discountValue !== undefined)
                    data.discountValue = dto.discountValue;
            }
            await tx.order.update({
                where: { id },
                data,
            });
            if (dto.items && Array.isArray(dto.items)) {
                for (const itemDto of dto.items) {
                    if (itemDto.id) {
                        await tx.orderItem.update({
                            where: { id: itemDto.id },
                            data: {
                                unitPrice: itemDto.unitPrice,
                                designTypeId: itemDto.designTypeId || null,
                                description: itemDto.description,
                                employeeRate: itemDto.employeeRate,
                                addons: itemDto.addons ? {
                                    deleteMany: {},
                                    create: itemDto.addons.map((a) => ({
                                        type: a.type,
                                        name: a.name,
                                        price: a.price,
                                        cost: a.cost
                                    }))
                                } : undefined
                            }
                        });
                    }
                }
            }
            return this.recalcOrderTotals(id, tx);
        });
    }
    async updateItem(orderId, itemId, branchId, dto) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const item = await this.prisma.orderItem.findFirst({
            where: { id: itemId, orderId },
        });
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
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        await this.prisma.orderItem.update({
            where: { id: itemId },
            data: { deletedAt: new Date(), status: 'CANCELLED' },
        });
        return this.recalcOrderTotals(orderId);
    }
    async cancelOrder(id, branchId, userId) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            await tx.orderItem.updateMany({
                where: { orderId: id, deletedAt: null },
                data: { status: 'CANCELLED', deletedAt: new Date() },
            });
            const updated = await tx.order.update({
                where: { id },
                data: { status: 'CANCELLED', deletedAt: new Date() },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: id,
                    fromStatus: order.status,
                    toStatus: 'CANCELLED',
                    changedById: userId,
                    actor: 'USER',
                    note: 'Order soft-cancelled by user',
                },
            });
            return updated;
        });
    }
    async addItem(orderId, branchId, itemDto) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findFirst({
                where: {
                    id: orderId,
                    deletedAt: null,
                    ...(branchId ? { branchId } : {}),
                },
            });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            const type = await tx.garmentType.findUnique({
                where: { id: itemDto.garmentTypeId },
            });
            if (!type || !type.isActive) {
                throw new common_1.BadRequestException('Garment type not found or inactive');
            }
            const customerPrice = itemDto.unitPrice !== undefined && itemDto.unitPrice !== 0 ? itemDto.unitPrice : type.customerPrice;
            const employeeRate = itemDto.employeeRate !== undefined && itemDto.employeeRate !== 0 ? itemDto.employeeRate : type.employeeRate;
            const lastItem = await tx.orderItem.findFirst({
                where: { orderId, garmentTypeId: itemDto.garmentTypeId },
                orderBy: { pieceNo: 'desc' },
            });
            let nextPieceNo = (lastItem?.pieceNo || 0) + 1;
            const quantity = itemDto.quantity || 1;
            const createdItems = [];
            for (let i = 0; i < quantity; i++) {
                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId,
                        garmentTypeId: type.id,
                        garmentTypeName: type.name,
                        pieceNo: nextPieceNo++,
                        employeeId: itemDto.employeeId || null,
                        quantity: 1,
                        unitPrice: customerPrice,
                        employeeRate: employeeRate,
                        description: itemDto.description,
                        fabricSource: itemDto.fabricSource || client_1.FabricSource.SHOP,
                        dueDate: itemDto.dueDate ? new Date(itemDto.dueDate) : null,
                        designTypeId: itemDto.designTypeId || null,
                        addons: {
                            create: (itemDto.addons || []).map((a) => ({
                                type: a.type,
                                name: a.name,
                                price: a.price,
                                cost: a.cost,
                            })),
                        },
                    },
                });
                createdItems.push(orderItem);
                const settings = await tx.systemSettings.findUnique({
                    where: { id: 'default' },
                });
                if (settings?.useTaskWorkflow) {
                    await this.generateTasksForItem(orderItem.id, orderItem.garmentTypeId, order.branchId, tx);
                }
            }
            return this.recalcOrderTotals(orderId, tx);
        });
    }
    async generateTasksForItem(orderItemId, garmentTypeId, branchId, tx) {
        const templates = await tx.workflowStepTemplate.findMany({
            where: { garmentTypeId, isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        if (templates.length === 0)
            return;
        const item = await tx.orderItem.findUnique({
            where: { id: orderItemId },
            select: { designTypeId: true },
        });
        const tasksToCreate = [];
        for (const t of templates) {
            const rateCard = await this.ratesService.findEffectiveRate(branchId, garmentTypeId, t.stepKey);
            const isDesignStep = t.stepKey.toUpperCase().includes('DESIGN');
            tasksToCreate.push({
                orderItemId,
                stepTemplateId: t.id,
                stepKey: t.stepKey,
                stepName: t.stepName,
                sortOrder: t.sortOrder,
                status: 'PENDING',
                rateCardId: rateCard?.id || null,
                rateSnapshot: rateCard?.amount || 0,
                designTypeId: isDesignStep ? item?.designTypeId : null,
            });
        }
        await tx.orderItemTask.createMany({
            data: tasksToCreate,
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        rates_service_1.RatesService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map