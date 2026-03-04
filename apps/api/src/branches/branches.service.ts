import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CustomerStatus,
  EmployeeStatus,
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { CreateBranchInput, UpdateBranchInput } from '@tbms/shared-types';
import { OPEN_ORDER_STATUSES } from '@tbms/shared-constants';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private normalizePagination(page = DEFAULT_PAGE, limit?: number) {
    if (!Number.isFinite(limit) || (limit ?? 0) <= 0) {
      return null;
    }

    const safePage =
      Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
    const safeLimit = Math.min(Math.trunc(limit as number), MAX_LIMIT);
    return {
      page: safePage,
      limit: safeLimit || DEFAULT_LIMIT,
      skip: (safePage - 1) * (safeLimit || DEFAULT_LIMIT),
    };
  }

  private async ensureCodeAvailable(code: string, excludingId?: string) {
    const existing = await this.prisma.branch.findFirst({
      where: {
        code,
        ...(excludingId ? { id: { not: excludingId } } : {}),
      },
    });

    if (!existing) {
      return;
    }

    if (existing.deletedAt) {
      throw new ConflictException(
        `Branch with code '${code}' existed but was deleted. Contact support.`,
      );
    }

    throw new ConflictException(`Branch with code '${code}' already exists`);
  }

  async findAll({
    search,
    page = 1,
    limit,
  }: { search?: string; page?: number; limit?: number } = {}) {
    const where: Prisma.BranchWhereInput = { deletedAt: null };
    const normalizedSearch = search?.trim();
    const pagination = this.normalizePagination(page, limit);

    if (normalizedSearch) {
      where.OR = [
        { name: { contains: normalizedSearch, mode: 'insensitive' } },
        { code: { contains: normalizedSearch, mode: 'insensitive' } },
      ];
    }

    if (pagination) {
      const { skip, limit: safeLimit } = pagination;
      const [data, total] = await Promise.all([
        this.prisma.branch.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: safeLimit,
          include: {
            _count: {
              select: {
                employees: { where: { deletedAt: null } },
                customers: { where: { deletedAt: null } },
                orders: { where: { deletedAt: null } },
              },
            },
          },
        }),
        this.prisma.branch.count({ where }),
      ]);
      return { data, total };
    }

    const data = await this.prisma.branch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            employees: { where: { deletedAt: null } },
            customers: { where: { deletedAt: null } },
            orders: { where: { deletedAt: null } },
          },
        },
      },
    });

    return { data, total: data.length };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            employees: { where: { deletedAt: null } },
            customers: { where: { deletedAt: null } },
            orders: { where: { deletedAt: null } },
          },
        },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const [
      totalGarmentTypes,
      activeEmployees,
      activeCustomers,
      openOrders,
      completedOrders,
      branchRateCards,
      globalRateCards,
    ] = await Promise.all([
      this.prisma.garmentType.count({
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.employee.count({
        where: { branchId: id, deletedAt: null, status: EmployeeStatus.ACTIVE },
      }),
      this.prisma.customer.count({
        where: { branchId: id, deletedAt: null, status: CustomerStatus.ACTIVE },
      }),
      this.prisma.order.count({
        where: {
          branchId: id,
          deletedAt: null,
          status: { in: [...OPEN_ORDER_STATUSES] },
        },
      }),
      this.prisma.order.count({
        where: {
          branchId: id,
          deletedAt: null,
          status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
        },
      }),
      this.prisma.rateCard.count({
        where: { branchId: id, deletedAt: null },
      }),
      this.prisma.rateCard.count({
        where: { branchId: null, deletedAt: null },
      }),
    ]);

    return {
      ...branch,
      stats: {
        totalGarments: totalGarmentTypes,
        activeEmployees,
        activeCustomers,
        openOrders,
        completedOrders,
        branchRateCards,
        globalRateCards,
        hasBranchRateOverrides: branchRateCards > 0,
      },
    };
  }

  async create(data: CreateBranchInput) {
    const normalizedCode = this.normalizeCode(data.code);
    await this.ensureCodeAvailable(normalizedCode);

    return this.prisma.branch.create({
      data: { ...data, code: normalizedCode },
    });
  }

  async update(id: string, data: UpdateBranchInput) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data });
  }

  async remove(id: string) {
    const branch = await this.prisma.branch.findUniqueOrThrow({
      where: { id },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: [...OPEN_ORDER_STATUSES],
                },
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (branch._count.orders > 0) {
      throw new ConflictException(
        `Cannot delete branch with ${branch._count.orders} active/overdue orders. Deactivate it instead, or complete/cancel the orders first.`,
      );
    }

    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.branch.count({ where: { deletedAt: null } }),
      this.prisma.branch.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.branch.count({ where: { deletedAt: null, isActive: false } }),
    ]);

    return { total, active, inactive };
  }
}
