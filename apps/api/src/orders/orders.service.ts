import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { OrderStatus, ItemStatus, DiscountType, Role } from '@tbms/shared-types';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateOrderNumber(branchId: string, tx: Prisma.TransactionClient): Promise<string> {
    const branch = await tx.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

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

  async create(createOrderDto: CreateOrderDto, branchId: string, createdById: string, userRole: string) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
        throw new BadRequestException('Order must contain at least one item');
    }

    if ((createOrderDto.discountType || createOrderDto.discountValue) && ![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
      throw new ForbiddenException('Only Admins can apply discounts');
    }

    // Wrap everything in a transaction for atomicity
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verify Customer
      const customer = await tx.customer.findUnique({ where: { id: createOrderDto.customerId } });
      if (!customer || (branchId && customer.branchId !== branchId)) {
          throw new NotFoundException('Customer not found or does not belong to this branch');
      }

      const orderBranchId = branchId || customer.branchId;

      // 2. Resolve Prices and compute item subtotals
      let subtotal = 0;
      const resolvedItems = [];

      // Fetch all necessary garments in one go preferably, 
      // but loop is fine for small N items
      for (const item of createOrderDto.items) {
          const type = await tx.garmentType.findUnique({ 
              where: { id: item.garmentTypeId }
          });

          if (!type || !type.isActive) {
              throw new BadRequestException(`Garment Type ${item.garmentTypeId} not found or inactive`);
          }

          const customerPrice = type.customerPrice;
          const employeeRate = type.employeeRate;

          subtotal += (customerPrice * item.quantity);

          resolvedItems.push({
              garmentTypeId: type.id,
              garmentTypeName: type.name, // SNAPSHOT
              employeeId: item.employeeId || null,
              quantity: item.quantity,
              unitPrice: customerPrice,   // SNAPSHOT (paisas)
              employeeRate: employeeRate, // SNAPSHOT (paisas)
              description: item.description,
              dueDate: item.dueDate ? new Date(item.dueDate) : null
          });
      }

      // 3. Compute Discount and Total
      let discountAmount = 0;
      if (createOrderDto.discountType && createOrderDto.discountValue !== undefined) {
         if (createOrderDto.discountType === DiscountType.FIXED) {
             discountAmount = createOrderDto.discountValue;
         } else if (createOrderDto.discountType === DiscountType.PERCENTAGE) {
             // value is basis points. e.g. 1000 = 10%
             discountAmount = Math.floor(subtotal * (createOrderDto.discountValue / 10000));
         }
      }

      if (discountAmount > subtotal) {
          throw new BadRequestException('Discount cannot exceed subtotal'); // or allow 0 total
      }

      const totalAmount = subtotal - discountAmount;
      
      // Advance Payments handling
      const initialPayment = createOrderDto.advancePayment || 0;
      if (initialPayment > totalAmount) {
          throw new BadRequestException('Advance payment cannot exceed total amount');
      }

      const balanceDue = totalAmount - initialPayment;

      // 4. Generate Number
      const orderNumber = await this.generateOrderNumber(orderBranchId, tx);

      // 5. Create Order
      const newOrder = await tx.order.create({
          data: {
              orderNumber,
              branchId: orderBranchId,
              customerId: customer.id,
              dueDate: new Date(createOrderDto.dueDate),
              subtotal: 0, // Will be set by recalc
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

      // 5.5 Recalculate Totals (sets subtotal, discountAmount, totalAmount, balanceDue correctly)
      const updatedOrder = await this.recalcOrderTotals(newOrder.id, tx);

      // 6. Record Initial Payment (if any)
      if (initialPayment > 0) {
          await tx.orderPayment.create({
              data: {
                  orderId: updatedOrder.id,
                  amount: initialPayment,
                  receivedById: createdById,
                  note: 'Advance Payment at Order Creation'
              }
          });

          // Update Customer Lifetime Value
          await tx.customer.update({
              where: { id: customer.id },
              data: { lifetimeValue: { increment: initialPayment } }
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
              note: 'Order Created'
          }
      });

      return updatedOrder;
    });
  }

  async recalcOrderTotals(orderId: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    
    // 1. Get all active items
    const items = await db.orderItem.findMany({
        where: { orderId, status: { not: 'CANCELLED' }, deletedAt: null },
        select: { unitPrice: true, quantity: true }
    });

    const subtotal = items.reduce((sum: number, item) => sum + (item.unitPrice * item.quantity), 0);

    // 2. Get order for discount info and totalPaid
    const order = await db.order.findUnique({
        where: { id: orderId },
        select: { discountType: true, discountValue: true, totalPaid: true }
    });

    if (!order) throw new NotFoundException('Order not found for recalculation');

    // 3. Compute Discount
    let discountAmount = 0;
    if (order.discountType === DiscountType.FIXED) {
        discountAmount = order.discountValue;
    } else if (order.discountType === DiscountType.PERCENTAGE) {
        // value is basis points. e.g. 1000 = 10%
        discountAmount = Math.floor(subtotal * (order.discountValue / 10000));
    }

    if (discountAmount > subtotal) discountAmount = subtotal;

    const totalAmount = subtotal - discountAmount;
    const balanceDue = Math.max(0, totalAmount - order.totalPaid);

    // 4. Update Order
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

  async findAll(
    branchId: string, 
    page = 1, 
    limit = 20, 
    filters: { status?: string; from?: string; to?: string; employeeId?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
  ) {
    const skip = (page - 1) * limit;
    const whereClause: Prisma.OrderWhereInput = { deletedAt: null };
    if (branchId) {
      whereClause.branchId = branchId;
    }
    
    // Sort logic
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (filters.sortBy) {
        (orderBy as any)[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
        orderBy.orderDate = 'desc';
    }
    
    if (filters.status && Object.values(OrderStatus).includes(filters.status as any)) {
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

    return {
      data,
      meta: { total, page, lastPage: Math.ceil(total / limit) }
    };
  }

  async findOne(id: string, branchId: string) {
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

      if (!order) throw new NotFoundException('Order not found');
      return order;
  }

  async addPayment(id: string, branchId: string, addPaymentDto: AddPaymentDto, receivedById: string) {
      return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
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
                  note: addPaymentDto.note
              }
          });

          // 2. Update Order (balance recalced within recalcOrderTotals)
          await tx.order.update({
              where: { id },
              data: { totalPaid: newTotalPaid }
          });

          // 3. Update Customer Lifetime Value
          await tx.customer.update({
              where: { id: order.customerId },
              data: { lifetimeValue: { increment: addPaymentDto.amount } }
          });

          return this.recalcOrderTotals(id, tx);
      });
  }

  async updateStatus(id: string, branchId: string, dto: UpdateOrderStatusDto, changedById: string) {
      return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
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
                  note: dto.note
              }
          });

          // 2. Update
          return tx.order.update({
              where: { id },
              data: { status: dto.status }
          });
      });
  }

  /**
   * Generates (or regenerates) a public shareToken + 4-digit sharePin on an order.
   * Returns the token so the frontend can build the shareable URL.
   */
  async generateShareLink(id: string, branchId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
    if (!order) throw new NotFoundException('Order not found');

    // Random hex token (URL-safe)
    const token = Array.from(
      { length: 16 },
      () => Math.floor(Math.random() * 16).toString(16)
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

  async update(id: string, branchId: string, dto: { dueDate?: string; notes?: string; discountType?: 'PERCENTAGE' | 'FIXED'; discountValue?: number; status?: string; employeeId?: string; }, userRole: string) {
    const order = await this.prisma.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
    if (!order) throw new NotFoundException('Order not found');

    const data: Prisma.OrderUpdateInput = {};
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) data.notes = dto.notes;
    
    if (dto.discountType !== undefined || dto.discountValue !== undefined) {
        if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
            throw new ForbiddenException('Only admins can change order status directly');
        }
        if (dto.discountType !== undefined) data.discountType = dto.discountType;
        if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
    }
    
    await this.prisma.order.update({
      where: { id },
      data,
    });

    return this.recalcOrderTotals(id);
  }

  async updateItem(orderId: string, itemId: string, branchId: string, dto: { status?: string; employeeId?: string }) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
    if (!order) throw new NotFoundException('Order not found');

    const item = await this.prisma.orderItem.findFirst({ where: { id: itemId, orderId } });
    if (!item) throw new NotFoundException('Order item not found');

    const updated = await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        status: (dto.status as import('@tbms/shared-types').ItemStatus) || undefined,
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
    const order = await this.prisma.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date(), status: 'CANCELLED' }
    });

    return this.recalcOrderTotals(orderId);
  }

  async cancelOrder(id: string, branchId: string, userId: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({ where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) } });
      if (!order) throw new NotFoundException('Order not found');

      // 1. Cancel all items
      await tx.orderItem.updateMany({
        where: { orderId: id, deletedAt: null },
        data: { status: 'CANCELLED', deletedAt: new Date() }
      });

      // 2. Set order status to CANCELLED and soft delete
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED', deletedAt: new Date() }
      });

      // 3. Log history
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

  async addItem(orderId: string, branchId: string, itemDto: { garmentTypeId: string; employeeId?: string; quantity?: number; description?: string; dueDate?: string }) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findFirst({ where: { id: orderId, deletedAt: null, ...(branchId ? { branchId } : {}) } });
      if (!order) throw new NotFoundException('Order not found');

      const type = await tx.garmentType.findUnique({ 
        where: { id: itemDto.garmentTypeId }
      });

      if (!type || !type.isActive) {
        throw new BadRequestException('Garment type not found or inactive');
      }

      const customerPrice = type.customerPrice;
      const employeeRate = type.employeeRate;

      await tx.orderItem.create({
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

      return this.recalcOrderTotals(orderId, tx);
    });
  }
}
