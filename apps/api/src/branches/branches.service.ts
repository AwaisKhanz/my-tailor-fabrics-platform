import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { OrderStatus, CreateBranchInput, UpdateBranchInput } from '@tbms/shared-types';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ search, page = 1, limit }: { search?: string, page?: number, limit?: number } = {}) {
    const where: Prisma.BranchWhereInput = { deletedAt: null };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (limit && limit > 0) {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.prisma.branch.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            _count: { select: { employees: true, customers: true, orders: true } },
          },
        }),
        this.prisma.branch.count({ where })
      ]);
      return { data, total };
    }

    const data = await this.prisma.branch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { employees: true, customers: true, orders: true } },
      },
    });
    
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { employees: true, customers: true, orders: true, priceOverrides: true } },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    
    // Get total garment types to calculate sync percentage
    const totalGarmentTypes = await this.prisma.garmentType.count({ where: { isActive: true } });
    
    return {
        ...branch,
        stats: {
            totalGarments: totalGarmentTypes,
            activeOverrides: branch._count.priceOverrides,
            syncPercentage: totalGarmentTypes > 0 ? Math.round(((totalGarmentTypes - branch._count.priceOverrides) / totalGarmentTypes) * 100) : 100
        }
    };
  }

  async create(data: CreateBranchInput) {
    const existing = await this.prisma.branch.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) {
        if (existing.deletedAt) {
            // Reactivate or error? PRD doesn't specify. Erroring is safer.
            throw new ConflictException(`Branch with code '${data.code}' existed but was deleted. Contact support.`);
        }
        throw new ConflictException(`Branch with code '${data.code}' already exists`);
    }

    return this.prisma.branch.create({
      data: { ...data, code: data.code.toUpperCase() },
    });
  }

  async update(id: string, data: UpdateBranchInput) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: data });
  }

  async remove(id: string) {
      const branch = await this.prisma.branch.findUniqueOrThrow({
          where: { id },
          include: {
              _count: {
                  select: {
                      orders: {
                          where: {
                              status: { in: [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.OVERDUE] },
                              deletedAt: null
                          }
                      }
                  }
              }
          }
      });

      if (branch._count.orders > 0) {
          throw new ConflictException(`Cannot delete branch with ${branch._count.orders} active/overdue orders. Deactivate it instead, or complete/cancel the orders first.`);
      }

      return this.prisma.branch.update({
          where: { id },
          data: { deletedAt: new Date(), isActive: false }
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
