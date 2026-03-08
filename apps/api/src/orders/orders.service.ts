import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  FabricSource as PrismaFabricSource,
  AddonType as PrismaAddonType,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client';
import {
  CreateOrderDto,
  OrderItemDto,
  OrderItemAddonDto,
} from './dto/create-order.dto';
import {
  UpdateOrderDto,
  UpdateOrderItemAddonDto,
  UpdateOrderItemAssignmentDto,
} from './dto/update-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import {
  AddonType,
  FabricSource as SharedFabricSource,
  DiscountType,
  ItemStatus,
  LedgerEntryType,
  OrderStatus,
  OrdersListSummary,
  Role,
  TaskStatus,
} from '@tbms/shared-types';
import { PERMISSION, hasAllPermissions, isRole } from '@tbms/shared-constants';
import { RatesService } from '../rates/rates.service';
import { calculateDiscountAmount, calculateOrderTotals } from './money';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { getStatusPinPepper } from '../common/env';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

type OrdersFindFilters = {
  status?: string;
  from?: string;
  to?: string;
  employeeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const ORDER_STATUS_TO_PRISMA: Record<OrderStatus, PrismaOrderStatus> = {
  [OrderStatus.NEW]: PrismaOrderStatus.NEW,
  [OrderStatus.IN_PROGRESS]: PrismaOrderStatus.IN_PROGRESS,
  [OrderStatus.READY]: PrismaOrderStatus.READY,
  [OrderStatus.OVERDUE]: PrismaOrderStatus.OVERDUE,
  [OrderStatus.DELIVERED]: PrismaOrderStatus.DELIVERED,
  [OrderStatus.COMPLETED]: PrismaOrderStatus.COMPLETED,
  [OrderStatus.CANCELLED]: PrismaOrderStatus.CANCELLED,
};

const ADDON_TYPE_TO_PRISMA: Record<AddonType, PrismaAddonType> = {
  [AddonType.EXTRA]: PrismaAddonType.EXTRA,
  [AddonType.ALTERATION]: PrismaAddonType.ALTERATION,
  [AddonType.DESIGN_CHARGE]: PrismaAddonType.DESIGN_CHARGE,
};

const FABRIC_SOURCE_TO_PRISMA: Record<SharedFabricSource, PrismaFabricSource> =
  {
    [SharedFabricSource.SHOP]: PrismaFabricSource.SHOP,
    [SharedFabricSource.CUSTOMER]: PrismaFabricSource.CUSTOMER,
  };

const ORDER_STATUS_VALUES = new Set<string>(Object.values(OrderStatus));

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUS_VALUES.has(value);
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  private hashPublicStatusPin(token: string, pin: string): string {
    return createHmac('sha256', getStatusPinPepper())
      .update(`${token}:${pin}`)
      .digest('hex');
  }

  private safeStringEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private parseOrderStatus(rawStatus?: string): OrderStatus | undefined {
    if (!rawStatus) {
      return undefined;
    }

    return isOrderStatus(rawStatus) ? rawStatus : undefined;
  }

  private toPrismaOrderStatus(status: OrderStatus): PrismaOrderStatus {
    return ORDER_STATUS_TO_PRISMA[status];
  }

  private toPrismaAddonType(type: AddonType): PrismaAddonType {
    return ADDON_TYPE_TO_PRISMA[type];
  }

  private toPrismaFabricSource(source: SharedFabricSource): PrismaFabricSource {
    return FABRIC_SOURCE_TO_PRISMA[source];
  }

  private async cancelActiveTasksForOrderItems(
    orderItemIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    if (orderItemIds.length === 0) {
      return { cancelledTasks: 0, deactivatedEarnings: 0 };
    }

    const activeTasks = await tx.orderItemTask.findMany({
      where: {
        orderItemId: { in: orderItemIds },
        status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (activeTasks.length === 0) {
      return { cancelledTasks: 0, deactivatedEarnings: 0 };
    }

    const taskIds = activeTasks.map((task) => task.id);
    const now = new Date();

    const [cancelledTasks, deactivatedEarnings] = await Promise.all([
      tx.orderItemTask.updateMany({
        where: {
          id: { in: taskIds },
          deletedAt: null,
        },
        data: {
          status: TaskStatus.CANCELLED,
          deletedAt: now,
        },
      }),
      tx.employeeLedgerEntry.updateMany({
        where: {
          orderItemTaskId: { in: taskIds },
          type: LedgerEntryType.EARNING,
          deletedAt: null,
        },
        data: {
          deletedAt: now,
        },
      }),
    ]);

    return {
      cancelledTasks: cancelledTasks.count,
      deactivatedEarnings: deactivatedEarnings.count,
    };
  }

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
    userRole: Role,
  ) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (
      (createOrderDto.discountType || createOrderDto.discountValue) &&
      (!isRole(userRole) ||
        !hasAllPermissions(userRole, [PERMISSION['orders.financial.manage']]))
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
      const resolvedItems: Array<{
        garmentTypeId: string;
        garmentTypeName: string;
        pieceNo: number;
        quantity: number;
        unitPrice: number;
        description: string | undefined;
        fabricSource: SharedFabricSource;
        dueDate: Date | null;
        designTypeId: string | null;
        addons: OrderItemAddonDto[];
      }> = [];
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

        const customerPrice =
          item.unitPrice !== undefined && item.unitPrice !== 0
            ? item.unitPrice
            : type.customerPrice;

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

          subtotal +=
            customerPrice + (designType?.defaultPrice || 0) + addonsPrice;

          resolvedItems.push({
            garmentTypeId: type.id,
            garmentTypeName: type.name,
            pieceNo: currentPieceNo, // SEQUENTIAL per garment type
            quantity: 1, // ALWAYS 1
            unitPrice: customerPrice,
            description: item.description,
            fabricSource: item.fabricSource ?? SharedFabricSource.SHOP,
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
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              description: item.description,
              fabricSource: this.toPrismaFabricSource(item.fabricSource),
              dueDate: item.dueDate,
              garmentTypeName: item.garmentTypeName,
              garmentType: { connect: { id: item.garmentTypeId } },
              designTypeId: item.designTypeId,
              addons: {
                create: (item.addons || []).map((a: OrderItemAddonDto) => ({
                  type: this.toPrismaAddonType(a.type),
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
      where: {
        orderId,
        status: { not: ItemStatus.CANCELLED },
        deletedAt: null,
      },
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

  private buildOrdersWhereClause(
    branchId: string | null,
    filters: OrdersFindFilters = {},
  ): Prisma.OrderWhereInput {
    const whereClause: Prisma.OrderWhereInput = { deletedAt: null };

    if (branchId) {
      whereClause.branchId = branchId;
    }

    const parsedStatus = this.parseOrderStatus(filters.status);
    if (parsedStatus) {
      whereClause.status = this.toPrismaOrderStatus(parsedStatus);
    }

    if (filters.from || filters.to) {
      whereClause.orderDate = {};
      if (filters.from) whereClause.orderDate.gte = new Date(filters.from);
      if (filters.to) whereClause.orderDate.lte = new Date(filters.to);
    }

    if (filters.employeeId) {
      whereClause.items = {
        some: {
          tasks: {
            some: {
              assignedEmployeeId: filters.employeeId,
              deletedAt: null,
            },
          },
        },
      };
    }

    if (filters.search) {
      const search = filters.search.trim();
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return whereClause;
  }

  private buildOrdersOrderBy(
    filters: OrdersFindFilters = {},
  ): Prisma.OrderOrderByWithRelationInput {
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    const sortOrder = filters.sortOrder || 'desc';

    if (filters.sortBy) {
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

    return orderBy;
  }

  async findAll(
    branchId: string | null,
    page = 1,
    limit = 20,
    filters: OrdersFindFilters = {},
  ) {
    const pagination = normalizePagination({ page, limit, defaultLimit: 20 });
    const whereClause = this.buildOrdersWhereClause(branchId, filters);
    const orderBy = this.buildOrdersOrderBy(filters);

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: {
          customer: { select: { fullName: true, phone: true } },
        },
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getSummary(
    branchId: string | null,
    filters: OrdersFindFilters = {},
  ): Promise<OrdersListSummary> {
    const whereClause = this.buildOrdersWhereClause(branchId, filters);

    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(now.getDate() + 7);

    const [totals, dueSoonCount, overdueCount, completedCount] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: whereClause,
          _sum: { totalAmount: true },
        }),
        this.prisma.order.count({
          where: {
            AND: [
              whereClause,
              {
                status: {
                  in: [
                    PrismaOrderStatus.NEW,
                    PrismaOrderStatus.IN_PROGRESS,
                    PrismaOrderStatus.READY,
                  ],
                },
                dueDate: {
                  gte: now,
                  lte: weekAhead,
                },
              },
            ],
          },
        }),
        this.prisma.order.count({
          where: {
            AND: [whereClause, { status: PrismaOrderStatus.OVERDUE }],
          },
        }),
        this.prisma.order.count({
          where: {
            AND: [
              whereClause,
              {
                status: {
                  in: [
                    PrismaOrderStatus.DELIVERED,
                    PrismaOrderStatus.COMPLETED,
                  ],
                },
              },
            ],
          },
        }),
      ]);

    return {
      totalValue: totals._sum.totalAmount ?? 0,
      dueSoonCount,
      overdueCount,
      completedCount,
    };
  }

  async findOne(id: string, branchId: string | null) {
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
          where: { deletedAt: null, reversedAt: null },
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

  async reversePayment(
    orderId: string,
    paymentId: string,
    branchId: string,
    reversedById: string,
    note?: string,
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      const payment = await tx.orderPayment.findFirst({
        where: {
          id: paymentId,
          orderId,
          deletedAt: null,
          reversedAt: null,
        },
      });
      if (!payment) {
        throw new NotFoundException(
          'Order payment not found or already reversed',
        );
      }

      const reversedAt = new Date();

      await tx.orderPayment.update({
        where: { id: payment.id },
        data: {
          reversedAt,
          reversedById,
          reversalNote: note ?? null,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          totalPaid: {
            decrement: payment.amount,
          },
        },
      });

      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          lifetimeValue: {
            decrement: payment.amount,
          },
        },
      });

      await this.recalcOrderTotals(order.id, tx);

      return {
        orderId: order.id,
        paymentId: payment.id,
        amount: payment.amount,
        reversedAt: reversedAt.toISOString(),
      };
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
      const nextStatus = this.toPrismaOrderStatus(dto.status);

      if (order.status === nextStatus) {
        return order; // no change
      }

      // 1. History
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: nextStatus,
          changedById,
          actor: 'USER',
          note: dto.note,
        },
      });

      // 2. Update
      return tx.order.update({
        where: { id },
        data: { status: nextStatus },
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

    // Crypto-secure token and pin for public tracking links
    const token = randomBytes(16).toString('hex');
    const pin = randomInt(0, 10000).toString().padStart(4, '0');
    const pinHash = this.hashPublicStatusPin(token, pin);

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        shareToken: token,
        sharePin: null,
        sharePinHash: pinHash,
        sharePinMigratedAt: null,
      },
      select: { id: true, orderNumber: true, shareToken: true },
    });

    return {
      ...updated,
      sharePin: pin,
    };
  }

  async getPublicOrderStatus(token: string, pin: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        shareToken: token,
        deletedAt: null,
      },
      select: {
        id: true,
        sharePin: true,
        sharePinHash: true,
        sharePinMigratedAt: true,
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

    const providedPinHash = this.hashPublicStatusPin(token, pin);
    const matchesHashedPin = order.sharePinHash
      ? this.safeStringEqual(order.sharePinHash, providedPinHash)
      : false;
    const matchesLegacyPin =
      !matchesHashedPin &&
      !!order.sharePin &&
      this.safeStringEqual(order.sharePin, pin);

    if (!matchesHashedPin && !matchesLegacyPin) {
      throw new NotFoundException('Invalid tracking link or PIN');
    }

    if (matchesLegacyPin && !order.sharePinHash && order.sharePin) {
      await this.prisma.order
        .update({
          where: { id: order.id },
          data: {
            sharePinHash: providedPinHash,
            sharePin: null,
            sharePinMigratedAt: new Date(),
          },
        })
        .catch(() => undefined);
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      dueDate: order.dueDate,
      totalAmount: order.totalAmount,
      balanceDue: order.balanceDue,
      status: order.status,
      customer: order.customer,
      items: order.items,
    };
  }

  async update(
    id: string,
    branchId: string,
    dto: UpdateOrderDto,
    userRole: Role,
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
        if (
          !isRole(userRole) ||
          !hasAllPermissions(userRole, [PERMISSION['orders.financial.manage']])
        ) {
          throw new ForbiddenException(
            'Only admins can change financial details',
          );
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

      // Handle items (Sync basic fields like unitPrice and designTypeId for existing items)
      if (dto.items && Array.isArray(dto.items)) {
        for (const itemDto of dto.items) {
          if (itemDto.id) {
            const existingItem = await tx.orderItem.findFirst({
              where: {
                id: itemDto.id,
                orderId: id,
                deletedAt: null,
              },
              select: { id: true, garmentTypeId: true },
            });
            if (!existingItem) {
              throw new NotFoundException('Order item not found');
            }

            // Update all pieces of this "logical" item if they share the same base configuration?
            // Actually, in our DB, each piece is an individual OrderItem.
            // But from the frontend's perspective, they might be sending IDs of specific pieces.
            await tx.orderItem.update({
              where: { id: existingItem.id },
              data: {
                unitPrice: itemDto.unitPrice,
                designTypeId: itemDto.designTypeId || null,
                description: itemDto.description,
                addons: itemDto.addons
                  ? {
                      deleteMany: {},
                      create: itemDto.addons.map(
                        (a: UpdateOrderItemAddonDto) => ({
                          type: this.toPrismaAddonType(a.type),
                          name: a.name,
                          price: a.price,
                          cost: a.cost,
                        }),
                      ),
                    }
                  : undefined,
              },
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
    dto: UpdateOrderItemAssignmentDto,
  ) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId },
      });
      if (!item) throw new NotFoundException('Order item not found');

      const updated = await tx.orderItem.update({
        where: { id: itemId },
        data: {
          status: dto.status || undefined,
        },
      });

      if (dto.status) {
        await this.recalcOrderTotals(orderId, tx);
      }

      return updated;
    });
  }

  async removeItem(orderId: string, itemId: string, branchId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      const item = await tx.orderItem.findFirst({
        where: { id: itemId, orderId, deletedAt: null },
        select: { id: true },
      });
      if (!item) {
        throw new NotFoundException('Order item not found');
      }

      await this.cancelActiveTasksForOrderItems([item.id], tx);

      await tx.orderItem.update({
        where: { id: item.id },
        data: { deletedAt: new Date(), status: ItemStatus.CANCELLED },
      });

      return this.recalcOrderTotals(orderId, tx);
    });
  }

  async cancelOrder(id: string, branchId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({
        where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
      });
      if (!order) throw new NotFoundException('Order not found');

      const activeOrderItems = await tx.orderItem.findMany({
        where: { orderId: id, deletedAt: null },
        select: { id: true },
      });

      await this.cancelActiveTasksForOrderItems(
        activeOrderItems.map((item) => item.id),
        tx,
      );

      await tx.orderItem.updateMany({
        where: { orderId: id, deletedAt: null },
        data: { status: ItemStatus.CANCELLED, deletedAt: new Date() },
      });

      const updated = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED, deletedAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
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

      const customerPrice =
        itemDto.unitPrice !== undefined && itemDto.unitPrice !== 0
          ? itemDto.unitPrice
          : type.customerPrice;

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
            quantity: 1, // ALWAYS 1
            unitPrice: customerPrice,
            description: itemDto.description,
            fabricSource: this.toPrismaFabricSource(
              itemDto.fabricSource ?? SharedFabricSource.SHOP,
            ),
            dueDate: itemDto.dueDate ? new Date(itemDto.dueDate) : null,
            designTypeId: itemDto.designTypeId || null,
            addons: {
              create: (itemDto.addons || []).map((a) => ({
                type: this.toPrismaAddonType(a.type),
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
      where: { garmentTypeId, isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    if (templates.length === 0) return;

    const item = await tx.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        designTypeId: true,
        designType: {
          select: {
            defaultRate: true,
          },
        },
      },
    });

    const tasksToCreate: {
      orderItemId: string;
      stepTemplateId: string;
      stepKey: string;
      stepName: string;
      sortOrder: number;
      status: TaskStatus;
      rateCardId: string | null;
      rateSnapshot: number;
      designRateSnapshot?: number | null;
      designTypeId?: string | null;
    }[] = [];
    for (const t of templates) {
      // Optional steps are only auto-generated when we can infer applicability.
      // For now, design-linked optional steps are included only when a design is selected.
      const isDesignStep = t.stepKey.toUpperCase().includes('DESIGN');
      const shouldCreateTask =
        t.isRequired || (isDesignStep && Boolean(item?.designTypeId));

      if (!shouldCreateTask) {
        continue;
      }

      const rateCard = await this.ratesService.findEffectiveRate(
        branchId,
        garmentTypeId,
        t.stepKey,
      );

      tasksToCreate.push({
        orderItemId,
        stepTemplateId: t.id,
        stepKey: t.stepKey,
        stepName: t.stepName,
        sortOrder: t.sortOrder,
        status: TaskStatus.PENDING,
        rateCardId: rateCard?.id || null,
        rateSnapshot: rateCard?.amount || 0,
        designRateSnapshot: isDesignStep
          ? (item?.designType?.defaultRate ?? null)
          : null,
        designTypeId: isDesignStep ? item?.designTypeId : null,
      });
    }

    if (tasksToCreate.length > 0) {
      await tx.orderItemTask.createMany({
        data: tasksToCreate,
      });
    }
  }
}
