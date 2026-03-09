import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus as PrismaOrderStatus } from '@prisma/client';
import {
  CreateOrderDto,
  OrderItemDto,
} from './dto/create-order.dto';
import {
  UpdateOrderDto,
  UpdateOrderItemAssignmentDto,
} from './dto/update-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import {
  FabricSource as SharedFabricSource,
  ItemStatus,
  LedgerEntryType,
  OrderStatus,
  OrdersListSummary,
  Role,
  TaskStatus,
} from '@tbms/shared-types';
import { RatesService } from '../rates/rates.service';
import {
  calculateOrderTotals,
  calculateOrderSubtotal,
} from './money';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';
import {
  buildPublicShareLinkUpdateData,
  buildPublicStatusPinMigrationData,
  createPublicShareCredentials,
  PUBLIC_ORDER_STATUS_SELECT,
  toPublicOrderStatusResponse,
  verifyPublicStatusPin,
} from './order-public-status';
import {
  assertOrderFinancialManagePermission,
  resolveValidatedOrderTotals,
} from './order-financial-rules';
import {
  buildOrdersOrderBy,
  buildOrdersWhereClause,
  type OrdersFindFilters,
  toPrismaOrderStatus,
} from './order-query-resolver';
import { resolveOrderItemDrafts, type ResolvedOrderItemDraft } from './order-item-draft-resolver';
import {
  recordOrderPayment,
  reverseRecordedOrderPayment,
} from './order-payment-lifecycle';
import {
  buildOrderCreateData,
  buildOrderUpdateData,
  toOrderItemUpdateData,
  toSingleOrderItemCreateData,
} from './order-create-mapping';
import { recordOrderStatusHistory } from './order-status-history';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
  ) {}

  private calculateDraftOrderSubtotal(
    items: readonly ResolvedOrderItemDraft[],
  ) {
    return calculateOrderSubtotal(
      items.map((item) => ({
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        designPrice: item.designPrice,
        addonsTotal: item.addonsTotal,
      })),
    );
  }

  private async calculateActiveOrderSubtotal(
    orderId: string,
    db: PrismaService | Prisma.TransactionClient,
  ) {
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

    return calculateOrderSubtotal(
      items.map((item) => ({
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        designPrice: item.designType?.defaultPrice ?? 0,
        addonsTotal: item.addons.reduce(
          (sum, addon) => sum + (addon.price || 0),
          0,
        ),
      })),
    );
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

    if (createOrderDto.discountType || createOrderDto.discountValue) {
      assertOrderFinancialManagePermission(
        userRole,
        'Only Admins can apply discounts',
      );
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
      const resolvedItems = await resolveOrderItemDrafts(
        tx,
        createOrderDto.items,
      );

      const subtotal = this.calculateDraftOrderSubtotal(resolvedItems);

      // 3. Compute Discount and Total
      const initialPayment = createOrderDto.advancePayment || 0;
      const { totalAmount } = resolveValidatedOrderTotals({
        subtotal,
        totalPaid: initialPayment,
        discountType: createOrderDto.discountType,
        discountValue: createOrderDto.discountValue,
        paymentErrorMessage: 'Advance payment cannot exceed total amount',
      });

      // 4. Generate Number
      const orderNumber = await this.generateOrderNumber(orderBranchId, tx);

      // 5. Create Order
      const newOrder = await tx.order.create({
        data: buildOrderCreateData({
          orderNumber,
          branchId: orderBranchId,
          customerId: customer.id,
          createdById,
          input: createOrderDto,
          items: resolvedItems,
        }),
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
      await this.recalcOrderTotals(newOrder.id, tx);

      // 6. Record Initial Payment (if any)
      if (initialPayment > 0) {
        await recordOrderPayment(tx, {
          orderId: newOrder.id,
          customerId: customer.id,
          amount: initialPayment,
          receivedById: createdById,
          note: 'Advance Payment at Order Creation',
        });
      }

      const updatedOrder = await this.recalcOrderTotals(newOrder.id, tx);

      // 7. Record History
      await recordOrderStatusHistory(tx, {
        orderId: updatedOrder.id,
        fromStatus: null,
        toStatus: PrismaOrderStatus.NEW,
        changedById: createdById,
        note: 'Order Created',
      });

      return updatedOrder;
    });
  }

  async recalcOrderTotals(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    const subtotal = await this.calculateActiveOrderSubtotal(orderId, db);

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
    branchId: string | null,
    page = 1,
    limit = 20,
    filters: OrdersFindFilters = {},
  ) {
    const pagination = normalizePagination({ page, limit, defaultLimit: 20 });
    const whereClause = buildOrdersWhereClause(branchId, filters);
    const orderBy = buildOrdersOrderBy(filters);

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
    const whereClause = buildOrdersWhereClause(branchId, filters);

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
      await recordOrderPayment(tx, {
        orderId: id,
        customerId: order.customerId,
        amount: addPaymentDto.amount,
        receivedById,
        note: addPaymentDto.note,
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
      await reverseRecordedOrderPayment(tx, {
        orderId: order.id,
        customerId: order.customerId,
        paymentId: payment.id,
        amount: payment.amount,
        reversedById,
        note,
        reversedAt,
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
      const nextStatus = toPrismaOrderStatus(dto.status);

      if (order.status === nextStatus) {
        return order; // no change
      }

      // 1. History
      await recordOrderStatusHistory(tx, {
        orderId: id,
        fromStatus: order.status,
        toStatus: nextStatus,
        changedById,
        note: dto.note,
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
    const { token, pin, pinHash } = createPublicShareCredentials();

    const updated = await this.prisma.order.update({
      where: { id },
      data: buildPublicShareLinkUpdateData({ token, pinHash }),
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
      select: PUBLIC_ORDER_STATUS_SELECT,
    });

    if (!order) {
      throw new NotFoundException('Invalid tracking link or PIN');
    }

    const { providedPinHash, matchesHashedPin, matchesLegacyPin } =
      verifyPublicStatusPin({
        token,
        providedPin: pin,
        sharePinHash: order.sharePinHash,
        sharePin: order.sharePin,
      });

    if (!matchesHashedPin && !matchesLegacyPin) {
      throw new NotFoundException('Invalid tracking link or PIN');
    }

    if (matchesLegacyPin && !order.sharePinHash && order.sharePin) {
      await this.prisma.order
        .update({
          where: { id: order.id },
          data: buildPublicStatusPinMigrationData({
            providedPinHash,
            migratedAt: new Date(),
          }),
        })
        .catch(() => undefined);
    }

    return toPublicOrderStatusResponse(order);
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

      const data = buildOrderUpdateData(dto);

      if (dto.discountType !== undefined || dto.discountValue !== undefined) {
        assertOrderFinancialManagePermission(
          userRole,
          'Only admins can change financial details',
        );

        const subtotal = await this.calculateActiveOrderSubtotal(id, tx);
        const nextDiscountType =
          dto.discountType !== undefined
            ? dto.discountType
            : order.discountType;
        const nextDiscountValue =
          dto.discountValue !== undefined
            ? dto.discountValue
            : order.discountValue;

        const { totalAmount } = resolveValidatedOrderTotals({
          subtotal,
          totalPaid: order.totalPaid,
          discountType: nextDiscountType,
          discountValue: nextDiscountValue,
          paymentErrorMessage: 'Existing payments exceed the updated order total',
        });

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
              data: toOrderItemUpdateData(itemDto),
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
        data: { status: PrismaOrderStatus.CANCELLED, deletedAt: new Date() },
      });

      await recordOrderStatusHistory(tx, {
        orderId: id,
        fromStatus: order.status,
        toStatus: PrismaOrderStatus.CANCELLED,
        changedById: userId,
        note: 'Order soft-cancelled by user',
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
          data: toSingleOrderItemCreateData({
            orderId,
            garmentType: type,
            pieceNo: nextPieceNo++,
            unitPrice: customerPrice,
            item: {
              description: itemDto.description,
              fabricSource: itemDto.fabricSource ?? SharedFabricSource.SHOP,
              dueDate: itemDto.dueDate,
              designTypeId: itemDto.designTypeId,
              addons: itemDto.addons,
            },
          }),
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
        new Date(),
        tx,
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
