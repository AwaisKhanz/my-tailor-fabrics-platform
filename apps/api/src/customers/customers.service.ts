import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { SearchService } from '../search/search.service';
import { CustomerStatus, CustomersListSummary } from '@tbms/shared-types';
import {
  buildPaginationMeta,
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

interface CustomersListFilters {
  search?: string;
  isVip?: boolean;
  status?: CustomerStatus;
}

function toPrismaMeasurementValues(
  values: UpsertMeasurementDto['values'],
): Prisma.InputJsonObject {
  return Object.entries(values).reduce<Prisma.InputJsonObject>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value === null ? null : value,
    }),
    {},
  );
}

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  private buildCustomersWhereClause(
    branchId: string | null,
    filters: CustomersListFilters = {},
    includeSearch = false,
  ): Prisma.CustomerWhereInput {
    const { search, isVip, status } = filters;
    const normalizedSearch = search?.trim();

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(typeof isVip === 'boolean' ? { isVip } : {}),
      ...(status ? { status } : {}),
    };

    if (includeSearch && normalizedSearch && normalizedSearch.length >= 2) {
      where.OR = [
        { fullName: { contains: normalizedSearch, mode: 'insensitive' } },
        { sizeNumber: { contains: normalizedSearch, mode: 'insensitive' } },
        { phone: { contains: normalizedSearch, mode: 'insensitive' } },
      ];
    }

    return where;
  }

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
    branchId: string | null,
    page = 1,
    limit = 20,
    search?: string,
    isVip?: boolean,
    status?: CustomerStatus,
  ) {
    const pagination = normalizePagination({ page, limit, defaultLimit: 20 });
    const { limit: safeLimit } = pagination;

    if (search && search.trim().length >= 2) {
      const results = await this.searchService.searchCustomers(
        search,
        branchId,
        safeLimit,
      );
      return {
        data: results,
        total: results.length,
        meta: buildPaginationMeta(results.length, {
          page: 1,
          limit: safeLimit,
        }),
      };
    }

    const where = this.buildCustomersWhereClause(
      branchId,
      {
        isVip,
        status,
      },
      false,
    );

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: pagination.skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getSummary(
    branchId: string | null,
    filters: CustomersListFilters = {},
  ): Promise<CustomersListSummary> {
    const where = this.buildCustomersWhereClause(branchId, filters, true);

    const [totalCustomers, whatsappConnectedCount, vipCustomersCount] =
      await Promise.all([
        this.prisma.customer.count({ where }),
        this.prisma.customer.count({
          where: {
            AND: [
              where,
              { whatsapp: { not: null } },
              { whatsapp: { not: '' } },
            ],
          },
        }),
        this.prisma.customer.count({
          where: {
            AND: [where, { isVip: true }],
          },
        }),
      ]);

    return {
      totalCustomers,
      whatsappConnectedCount,
      vipCustomersCount,
    };
  }

  async findOne(id: string, branchId: string | null) {
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

  async getOrders(id: string, branchId: string | null, page = 1, limit = 20) {
    await this.findOne(id, branchId);
    const pagination = normalizePagination({ page, limit, defaultLimit: 20 });

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          customerId: id,
          deletedAt: null,
          ...(branchId ? { branchId } : {}),
        },
        skip: pagination.skip,
        take: pagination.limit,
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

    return toPaginatedResponse(data, total, pagination);
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

    const measurementValues = toPrismaMeasurementValues(dto.values);

    return this.prisma.customerMeasurement.upsert({
      where: {
        customerId_categoryId: { customerId: id, categoryId: dto.categoryId },
      },
      update: { values: measurementValues },
      create: {
        customerId: id,
        categoryId: dto.categoryId,
        values: measurementValues,
      },
    });
  }

  async toggleVip(id: string, branchId: string, isVip: boolean) {
    await this.findOne(id, branchId);
    return this.prisma.customer.update({ where: { id }, data: { isVip } });
  }
}
