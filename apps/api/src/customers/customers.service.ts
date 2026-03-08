import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { SearchService } from '../search/search.service';
import {
  CustomerStatus,
  CustomersSummaryQueryInput,
  CustomersListSummary,
  FieldType,
  MeasurementValuesMeta,
} from '@tbms/shared-types';
import {
  buildPaginationMeta,
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

type JsonRecord = Record<string, Prisma.JsonValue>;

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

function toPrismaMeasurementValuesMeta(
  valuesMeta: MeasurementValuesMeta,
): Prisma.InputJsonObject {
  return Object.entries(valuesMeta).reduce<Prisma.InputJsonObject>(
    (metaAcc, [fieldId, snapshot]) => ({
      ...metaAcc,
      [fieldId]: {
        fieldId: snapshot.fieldId,
        label: snapshot.label,
        fieldType: snapshot.fieldType,
        unit: snapshot.unit ?? null,
        sectionId: snapshot.sectionId ?? null,
        sectionName: snapshot.sectionName ?? null,
        isRequired: snapshot.isRequired,
      },
    }),
    {},
  );
}

function isJsonRecord(value: Prisma.JsonValue): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toSharedFieldType(fieldType: string): FieldType {
  switch (fieldType) {
    case 'TEXT':
      return FieldType.TEXT;
    case 'DROPDOWN':
      return FieldType.DROPDOWN;
    default:
      return FieldType.NUMBER;
  }
}

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  private buildCustomersWhereClause(
    branchId: string | null,
    filters: CustomersSummaryQueryInput = {},
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
    filters: CustomersSummaryQueryInput = {},
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

    const openOrdersCount = await this.prisma.order.count({
      where: {
        customerId: id,
        branchId,
        deletedAt: null,
        status: { in: ['NEW', 'IN_PROGRESS', 'READY', 'OVERDUE'] },
      },
    });

    if (openOrdersCount > 0) {
      throw new BadRequestException(
        `Cannot archive customer with ${openOrdersCount} active order(s).`,
      );
    }

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
      include: {
        sections: {
          where: { deletedAt: null },
          select: { id: true, name: true },
        },
        fields: {
          where: { deletedAt: null },
          select: {
            id: true,
            label: true,
            fieldType: true,
            unit: true,
            sectionId: true,
            isRequired: true,
          },
        },
      },
    });
    if (!category || !category.isActive)
      throw new NotFoundException('Measurement Category not found or inactive');

    const measurementValues = toPrismaMeasurementValues(dto.values);
    const sectionNameById = new Map(
      category.sections.map((section) => [section.id, section.name]),
    );

    const valuesMeta: MeasurementValuesMeta = {};
    for (const field of category.fields) {
      if (!(field.id in dto.values)) {
        continue;
      }

      valuesMeta[field.id] = {
        fieldId: field.id,
        label: field.label,
        fieldType: toSharedFieldType(field.fieldType),
        unit: field.unit,
        sectionId: field.sectionId,
        sectionName: field.sectionId
          ? (sectionNameById.get(field.sectionId) ?? null)
          : null,
        isRequired: field.isRequired,
      };
    }

    const measurementValuesMeta = toPrismaMeasurementValuesMeta(valuesMeta);

    return this.prisma.customerMeasurement.upsert({
      where: {
        customerId_categoryId: { customerId: id, categoryId: dto.categoryId },
      },
      update: {
        values: measurementValues,
        valuesMeta: measurementValuesMeta,
      },
      create: {
        customerId: id,
        categoryId: dto.categoryId,
        values: measurementValues,
        valuesMeta: measurementValuesMeta,
      },
    });
  }

  async toggleVip(id: string, branchId: string, isVip: boolean) {
    await this.findOne(id, branchId);
    return this.prisma.customer.update({ where: { id }, data: { isVip } });
  }

  async backfillMeasurementValueSnapshots(branchId: string) {
    const records = await this.prisma.customerMeasurement.findMany({
      where: {
        valuesMeta: { equals: Prisma.AnyNull },
        customer: {
          branchId,
          deletedAt: null,
        },
      },
      include: {
        category: {
          include: {
            sections: {
              where: { deletedAt: null },
              select: { id: true, name: true },
            },
            fields: {
              where: { deletedAt: null },
              select: {
                id: true,
                label: true,
                fieldType: true,
                unit: true,
                sectionId: true,
                isRequired: true,
              },
            },
          },
        },
      },
    });

    let updated = 0;

    for (const record of records) {
      const sectionNameById = new Map(
        record.category.sections.map((section) => [section.id, section.name]),
      );
      if (!isJsonRecord(record.values)) {
        continue;
      }

      const valuesRecord = record.values;
      const nextMeta: MeasurementValuesMeta = {};

      for (const field of record.category.fields) {
        if (!(field.id in valuesRecord)) {
          continue;
        }

        nextMeta[field.id] = {
          fieldId: field.id,
          label: field.label,
          fieldType: toSharedFieldType(field.fieldType),
          unit: field.unit,
          sectionId: field.sectionId,
          sectionName: field.sectionId
            ? (sectionNameById.get(field.sectionId) ?? null)
            : null,
          isRequired: field.isRequired,
        };
      }

      await this.prisma.customerMeasurement.update({
        where: { id: record.id },
        data: {
          valuesMeta: toPrismaMeasurementValuesMeta(nextMeta),
        },
      });
      updated += 1;
    }

    return {
      processed: records.length,
      updated,
      skipped: records.length - updated,
    };
  }
}
