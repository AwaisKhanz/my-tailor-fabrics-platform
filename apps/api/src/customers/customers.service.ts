import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { SearchService } from '../search/search.service';
import { CustomerStatus } from '@tbms/shared-types';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  private async generateSizeNumber(branchId: string): Promise<string> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const prefix = `C-${branch.code}-`;
    const lastCustomer = await this.prisma.customer.findFirst({
      where: { branchId, sizeNumber: { startsWith: prefix } },
      orderBy: { sizeNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastCustomer) {
      const parts = lastCustomer.sizeNumber.split('-');
      if (parts.length === 3) nextNumber = parseInt(parts[2], 10) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  async create(createCustomerDto: CreateCustomerDto, branchId: string) {
    const sizeNumber = await this.generateSizeNumber(branchId);
    return this.prisma.customer.create({
      data: { ...createCustomerDto, sizeNumber, branchId },
    });
  }

  async findAll(
    branchId: string,
    page = 1,
    limit = 20,
    search?: string,
    isVip?: boolean,
    status?: CustomerStatus,
  ) {
    if (search && search.trim().length >= 2) {
      const results = await this.searchService.searchCustomers(
        search,
        branchId,
        limit,
      );
      return {
        data: results,
        meta: { total: results.length, page: 1, lastPage: 1 },
      };
    }

    const skip = (page - 1) * limit;
    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(typeof isVip === 'boolean' ? { isVip } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
  }

  async findOne(id: string, branchId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      include: { measurements: { include: { category: true } } },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // PRD Requirement: Include order summary
    const [totalOrders, stats] = await Promise.all([
      this.prisma.order.count({
        where: {
          customerId: id,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      }),
      this.prisma.order.aggregate({
        where: {
          customerId: id,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
        _sum: { totalPaid: true },
      }),
    ]);

    return {
      ...customer,
      stats: {
        totalOrders,
        totalSpent: stats._sum.totalPaid || 0,
      },
    };
  }

  async update(
    id: string,
    branchId: string,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    await this.findOne(id, branchId);
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getOrders(id: string, branchId: string, page = 1, limit = 20) {
    await this.findOne(id, branchId);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId: id,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: { items: true },
      }),
      this.prisma.order.count({
        where: {
          customerId: id,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
      }),
    ]);

    return { data, total };
  }

  async upsertMeasurement(
    id: string,
    branchId: string,
    dto: UpsertMeasurementDto,
  ) {
    await this.findOne(id, branchId);
    const category = await this.prisma.measurementCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category || !category.isActive)
      throw new NotFoundException('Measurement Category not found or inactive');

    return this.prisma.customerMeasurement.upsert({
      where: {
        customerId_categoryId: { customerId: id, categoryId: dto.categoryId },
      },
      update: { values: dto.values as Prisma.InputJsonValue },
      create: {
        customerId: id,
        categoryId: dto.categoryId,
        values: dto.values as Prisma.InputJsonValue,
      },
    });
  }

  async toggleVip(id: string, branchId: string, isVip: boolean) {
    await this.findOne(id, branchId);
    return this.prisma.customer.update({ where: { id }, data: { isVip } });
  }
}
