import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, FabricSource, AddonType as PrismaAddonType } from '@prisma/client';
import { CreateOrderDto, OrderItemDto, OrderItemAddonDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderItemAddonDto } from './dto/update-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import {
  OrderStatus,
  ItemStatus,
  DiscountType,
  Role,
} from '@tbms/shared-types';
import { RatesService } from '../rates/rates.service';
import { calculateDiscountAmount, calculateOrderTotals } from './money';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  private async generateOrderNumber(
    branchId: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const branch = await tx.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

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

  async create(
    createOrderDto: CreateOrderDto,
    branchId: string,
    createdById: string,
    userRole: string,
  ) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (
      (createOrderDto.discountType || createOrderDto.discountValue) &&
      ![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)
    ) {
      throw new ForbiddenException('Only Admins can apply discounts');
    }

    // Wrap everything in a transaction for atomicity
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verify Customer
      const customer = await tx.customer.findUnique({
        where: { id: createOrderDto.customerId },
      });
      if (!customer || (branchId && customer.branchId !== branchId)) {
        throw new NotFoundException(
          'Customer not found or does not belong to this branch',
        );
      }

      const orderBranchId = branchId || customer.branchId;

      // 2. Resolve Prices and compute item subtotals
      let subtotal = 0;
      const resolvedItems = [];
      const pieceMap: Record<string, number> = {};

      for (const item of createOrderDto.items) {
        const type = await tx.garmentType.findUnique({
          where: { id: item.garmentTypeId },
        });

        if (!type || !type.isActive) {
          throw new BadRequestException(
            `Garment Type ${item.garmentTypeId} not found or inactive`,
          );
        }

        const customerPrice = item.unitPrice !== undefined && item.unitPrice !== 0 ? item.unitPrice : type.customerPrice;
        const employeeRate = item.employeeRate !== undefined && item.employeeRate !== 0 ? item.employeeRate : type.employeeRate;

        // Split quantity into individual pieces
        for (let i = 0; i < item.quantity; i++) {
          pieceMap[item.garmentTypeId] =
            (pieceMap[item.garmentTypeId] || 0) + 1;
          const currentPieceNo = pieceMap[item.garmentTypeId];

          const designType = item.designTypeId
            ? await tx.designType.findUnique({
                where: { id: item.designTypeId },
              })
            : null;

          const addonsPrice = (item.addons || []).reduce(
            (sum, a) => sum + (a.price || 0),
            0,
          );

          subtotal += customerPrice + (designType?.defaultPrice || 0) + addonsPrice;

          resolvedItems.push({
            garmentTypeId: type.id,
            garmentTypeName: type.name,
            pieceNo: currentPieceNo, // SEQUENTIAL per garment type
            employeeId: item.employeeId || null,
            quantity: 1, // ALWAYS 1
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

      // 3. Compute Discount and Total
      if (
        createOrderDto.discountType &&
        createOrderDto.discountValue !== undefined
      ) {
        const rawDiscountAmount =
          createOrderDto.discountType === DiscountType.FIXED
            ? createOrderDto.discountValue
            : Math.floor(subtotal * (createOrderDto.discountValue / 10000));
        if (rawDiscountAmount > subtotal) {
          throw new BadRequestException('Discount cannot exceed subtotal');
        }
      }

      const discountAmount = calculateDiscountAmount(
        subtotal,
        createOrderDto.discountType,
        createOrderDto.discountValue ?? 0,
      );
      const totalAmount = subtotal - discountAmount;

      // Advance Payments handling
      const initialPayment = createOrderDto.advancePayment || 0;
      if (initialPayment > totalAmount) {
        throw new BadRequestException(
          'Advance payment cannot exceed total amount',
        );
      }

      // 4. Generate Number
      const orderNumber = await this.generateOrderNumber(orderBranchId, tx);

      // 5. Create Order
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
              fabricSource:
                (item.fabricSource as FabricSource) ?? FabricSource.SHOP,
              dueDate: item.dueDate,
              garmentTypeName: item.garmentTypeName,
              garmentType: { connect: { id: item.garmentTypeId } },
              designTypeId: item.designTypeId,
              addons: {
                create: (item.addons || []).map((a: OrderItemAddonDto) => ({
                  type: a.type as PrismaAddonType,
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

      // 5.1 If System Settings useTaskWorkflow is enabled, generate tasks
      const settings = await tx.systemSettings.findUnique({
        where: { id: 'default' },
      });
      if (settings?.useTaskWorkflow) {
        for (const item of newOrder.items) {
          await this.generateTasksForItem(
            item.id,
            item.garmentTypeId,
            orderBranchId,
            tx,
          );
        }
      }

      // 5.5 Recalculate Totals (sets subtotal, discountAmount, totalAmount, balanceDue correctly)
      const updatedOrder = await this.recalcOrderTotals(newOrder.id, tx);

      // 6. Record Initial Payment (if any)
      if (initialPayment > 0) {
        await tx.orderPayment.create({
          data: {
            orderId: updatedOrder.id,
            amount: initialPayment,
            receivedById: createdById,
            note: 'Advance Payment at Order Creation',
          },
        });

        // Update Customer Lifetime Value
        await tx.customer.update({
          where: { id: customer.id },
          data: { lifetimeValue: { increment: initialPayment } },
        });
      }

      // 7. Record History
      await tx.orderStatusHistory.create({
        data: {
          orderId: updatedOrder.id,
          fromStatus: null,
          toStatus: OrderStatus.NEW,
          changedById: createdById,
          actor: 'USER',
          note: 'Order Created',
        },
      });

      return updatedOrder;
    });
  }

  async recalcOrderTotals(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;

    // 1. Get all active items
    const items = await db.orderItem.findMany({
      where: { orderId, status: { not: 'CANCELLED' }, deletedAt: null },
      include: {
        addons: { where: { deletedAt: null } },
        designType: true,
      },
    });

    const subtotal = items.reduce((sum: number, item) => {
      const itemBase = item.unitPrice * item.quantity;
      const designPrice = (item.designType?.defaultPrice || 0) * item.quantity;
      const addonsTotal = item.addons.reduce(
        (aSum, addon) => aSum + (addon.price || 0),
        0,
      );
      return sum + itemBase + designPrice + addonsTotal;
    }, 0);

    // 2. Get order for discount info and totalPaid
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { discountType: true, discountValue: true, totalPaid: true },
    });

    if (!order)
      throw new NotFoundException('Order not found for recalculation');

    const { discountAmount, totalAmount, balanceDue } = calculateOrderTotals(
      subtotal,
      order.totalPaid,
      order.discountType,
      order.discountValue,
    );

    // 4. Update Order
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

  async findAll(
    branchId: string,
    page = 1,
    limit = 20,
    filters: {
      status?: string;
      from?: string;
      to?: string;
      employeeId?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.OrderWhereInput = { deletedAt: null };
    if (branchId) {
      whereClause.branchId = branchId;
    }

    // Sort logic
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
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
    } else {
      orderBy.orderDate = 'desc';
    }

    if (
      filters.status &&
      Object.values(OrderStatus).includes(filters.status as OrderStatus)
    ) {
      whereClause.status = filters.status as OrderStatus;
    }

    if (filters.from || filters.to) {
      whereClause.orderDate = {};
      if (filters.from) whereClause.orderDate.gte = new Date(filters.from);
      if (filters.to) whereClause.orderDate.lte = new Date(filters.to);
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

  async findOne(id: string, branchId: string) {
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

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async addPayment(
    id: string,
    branchId: string,
    addPaymentDto: AddPaymentDto,
    receivedById: string,
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (addPaymentDto.amount > order.balanceDue) {
        throw new BadRequestException('Payment amount exceeds balance due');
      }

      const newTotalPaid = order.totalPaid + addPaymentDto.amount;
      const newBalanceDue = order.balanceDue - addPaymentDto.amount;

      // 1. Log Payment
      await tx.orderPayment.create({
        data: {
          orderId: id,
          amount: addPaymentDto.amount,
          receivedById,
          note: addPaymentDto.note,
        },
      });

      // 2. Update Order (balance recalced within recalcOrderTotals)
      await tx.order.update({
        where: { id },
        data: { totalPaid: newTotalPaid },
      });

      // 3. Update Customer Lifetime Value
      await tx.customer.update({
        where: { id: order.customerId },
        data: { lifetimeValue: { increment: addPaymentDto.amount } },
      });

      return this.recalcOrderTotals(id, tx);
    });
  }

  async updateStatus(
    id: string,
    branchId: string,
    dto: UpdateOrderStatusDto,
    changedById: string,
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (order.status === dto.status) {
        return order; // no change
      }

      // 1. History
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

      // 2. Update
      return tx.order.update({
        where: { id },
        data: { status: dto.status },
      });
    });
  }

  /**
   * Generates (or regenerates) a public shareToken + 4-digit sharePin on an order.
   * Returns the token so the frontend can build the shareable URL.
   */
  async generateShareLink(id: string, branchId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Random hex token (URL-safe)
    const token = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');

    // 4-digit PIN
    const pin = String(Math.floor(1000 + Math.random() * 9000));

    const updated = await this.prisma.order.update({
      where: { id },
      data: { shareToken: token, sharePin: pin },
      select: { id: true, orderNumber: true, shareToken: true, sharePin: true },
    });

    return updated;
  }

  async getPublicOrderStatus(token: string, pin: string) {
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
      throw new NotFoundException('Invalid tracking link or PIN');
    }

    return order;
  }

  async update(
    id: string,
    branchId: string,
    dto: UpdateOrderDto,
    userRole: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');

      const data: Prisma.OrderUpdateInput = {};
      if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
      if (dto.notes !== undefined) data.notes = dto.notes;

      if (dto.discountType !== undefined || dto.discountValue !== undefined) {
        if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
          throw new ForbiddenException('Only admins can change financial details');
        }
        if (dto.discountType !== undefined) data.discountType = dto.discountType;
        if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
      }

      await tx.order.update({
        where: { id },
        data,
      });

      // Handle items (Sync basic fields like unitPrice and designTypeId for existing items)
      if (dto.items && Array.isArray(dto.items)) {
        for (const itemDto of dto.items) {
          if (itemDto.id) {
            // Update all pieces of this "logical" item if they share the same base configuration?
            // Actually, in our DB, each piece is an individual OrderItem.
            // But from the frontend's perspective, they might be sending IDs of specific pieces.
            await tx.orderItem.update({
              where: { id: itemDto.id },
              data: {
                unitPrice: itemDto.unitPrice,
                designTypeId: itemDto.designTypeId || null,
                description: itemDto.description,
                employeeRate: itemDto.employeeRate,
                addons: itemDto.addons ? {
                  deleteMany: {},
                  create: itemDto.addons.map((a: UpdateOrderItemAddonDto) => ({
                    type: a.type as PrismaAddonType,
                    name: a.name as string,
                    price: a.price as number,
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

  async updateItem(
    orderId: string,
    itemId: string,
    branchId: string,
    dto: { status?: string; employeeId?: string },
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status:
          (dto.status as import('@tbms/shared-types').ItemStatus) || undefined,
        employeeId: dto.employeeId || undefined,
      },
    });

    // If status changed to/from CANCELLED, we must recalc order totals
    if (dto.status) {
      await this.recalcOrderTotals(orderId);
    }

    return updated;
  }

  async removeItem(orderId: string, itemId: string, branchId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });

    return this.recalcOrderTotals(orderId);
  }

  async cancelOrder(id: string, branchId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
      });
      if (!order) throw new NotFoundException('Order not found');

      // 1. Cancel all items
      await tx.orderItem.updateMany({
        where: { orderId: id, deletedAt: null },
        data: { status: 'CANCELLED', deletedAt: new Date() },
      });

      // 2. Set order status to CANCELLED and soft delete
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED', deletedAt: new Date() },
      });

      // 3. Log history
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

  async addItem(orderId: string, branchId: string, itemDto: OrderItemDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      const type = await tx.garmentType.findUnique({
        where: { id: itemDto.garmentTypeId },
      });

      if (!type || !type.isActive) {
        throw new BadRequestException('Garment type not found or inactive');
      }

      const customerPrice = itemDto.unitPrice !== undefined && itemDto.unitPrice !== 0 ? itemDto.unitPrice : type.customerPrice;
      const employeeRate = itemDto.employeeRate !== undefined && itemDto.employeeRate !== 0 ? itemDto.employeeRate : type.employeeRate;

      // 1. Find max pieceNo for this garment type in this order
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
            quantity: 1, // ALWAYS 1
            unitPrice: customerPrice,
            employeeRate: employeeRate,
            description: itemDto.description,
            fabricSource: itemDto.fabricSource || FabricSource.SHOP,
            dueDate: itemDto.dueDate ? new Date(itemDto.dueDate) : null,
            designTypeId: itemDto.designTypeId || null,
            addons: {
              create: (itemDto.addons || []).map((a) => ({
                type: a.type as PrismaAddonType,
                name: a.name,
                price: a.price,
                cost: a.cost,
              })),
            },
          },
        });
        createdItems.push(orderItem);

        // 2. Generate Tasks
        const settings = await tx.systemSettings.findUnique({
          where: { id: 'default' },
        });
        if (settings?.useTaskWorkflow) {
          await this.generateTasksForItem(
            orderItem.id,
            orderItem.garmentTypeId,
            order.branchId,
            tx,
          );
        }
      }

      return this.recalcOrderTotals(orderId, tx);
    });
  }

  private async generateTasksForItem(
    orderItemId: string,
    garmentTypeId: string,
    branchId: string,
    tx: Prisma.TransactionClient,
  ) {
    const templates = await tx.workflowStepTemplate.findMany({
      where: { garmentTypeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (templates.length === 0) return;

    const item = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      select: { designTypeId: true },
    });

    const tasksToCreate: {
      orderItemId: string;
      stepTemplateId: string;
      stepKey: string;
      stepName: string;
      sortOrder: number;
      status: 'PENDING';
      rateCardId: string | null;
      rateSnapshot: number;
      designTypeId?: string | null;
    }[] = [];
    for (const t of templates) {
      const rateCard = await this.ratesService.findEffectiveRate(
        branchId,
        garmentTypeId,
        t.stepKey,
      );

      // If it's a DESIGN task, link it to the item's designTypeId
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
}
