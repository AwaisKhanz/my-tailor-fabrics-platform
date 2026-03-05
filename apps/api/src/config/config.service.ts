import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateGarmentTypeDto,
  UpdateGarmentTypeDto,
} from './dto/garment-type.dto';
import {
  CreateMeasurementCategoryDto,
  UpdateMeasurementCategoryDto,
  CreateMeasurementSectionDto,
  CreateMeasurementFieldDto,
  UpdateMeasurementFieldDto,
} from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';
import {
  GarmentTypeWithAnalytics,
  FieldType,
  SystemSettings,
} from '@tbms/shared-types';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const toSharedFieldType = (fieldType: string): FieldType => {
  switch (fieldType) {
    case 'NUMBER':
      return FieldType.NUMBER;
    case 'TEXT':
      return FieldType.TEXT;
    case 'DROPDOWN':
      return FieldType.DROPDOWN;
    default:
      return FieldType.NUMBER;
  }
};

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Branches ---
  async getBranches() {
    return this.prisma.branch.findMany({
      orderBy: { createdAt: 'desc' },
      where: { isActive: true },
    });
  }

  // --- System Settings ---
  async getSystemSettings(): Promise<SystemSettings> {
    let settings = await this.prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await this.prisma.systemSettings.create({
        data: { id: 'default' },
      });
    }

    return settings;
  }

  async updateSystemSettings(
    dto: UpdateSystemSettingsDto,
  ): Promise<SystemSettings> {
    const settings = await this.prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: dto,
      create: { id: 'default', ...dto },
    });

    return settings;
  }

  // --- Garment Types ---
  async getGarmentTypes(
    options: {
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { search, page = 1, limit = 10 } = options;
    const pagination = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
      maxLimit: 100,
    });

    const where: Prisma.GarmentTypeWhereInput = {
      isActive: true,
      deletedAt: null,
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, types] = await Promise.all([
      this.prisma.garmentType.count({ where }),
      this.prisma.garmentType.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          measurementCategories: true,
          workflowSteps: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    const data = types.map((t) => {
      return {
        ...t,
        marginAmount: t.customerPrice - t.employeeRate,
        marginPercentage:
          t.customerPrice > 0
            ? Math.round(
                ((t.customerPrice - t.employeeRate) / t.customerPrice) * 100,
              )
            : 0,
      };
    });

    return toPaginatedResponse(data, total, pagination);
  }

  async getGarmentType(id: string): Promise<GarmentTypeWithAnalytics> {
    const garment = await this.prisma.garmentType.findUniqueOrThrow({
      where: { id, deletedAt: null },
      include: {
        workflowSteps: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        measurementCategories: {
          where: { deletedAt: null },
          include: {
            sections: {
              orderBy: { sortOrder: 'asc' },
            },
            fields: {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
              include: {
                section: true,
              },
            },
          },
        },
        priceLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: { select: { name: true } },
          },
        },
        rateCards: {
          where: { deletedAt: null, effectiveTo: null },
          include: { branch: { select: { name: true, code: true } } },
        },
      },
    });

    // Aggregate Order Data
    const orderStats = await this.prisma.orderItem.aggregate({
      where: { garmentTypeId: id, deletedAt: null },
      _count: { id: true },
      _sum: { unitPrice: true, employeeRate: true },
    });

    const activeOrdersCount = await this.prisma.orderItem.count({
      where: {
        garmentTypeId: id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    });

    // Top Tailors (Efficiency)
    const topTailorsData = await this.prisma.orderItem.groupBy({
      by: ['employeeId'],
      where: {
        garmentTypeId: id,
        employeeId: { not: null },
        status: 'COMPLETED',
        deletedAt: null,
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 3,
    });

    const topTailors = await Promise.all(
      topTailorsData.map(async (t) => {
        const employee = await this.prisma.employee.findUnique({
          where: { id: t.employeeId! },
          select: { fullName: true },
        });
        return {
          name: employee?.fullName || 'Removed Employee',
          count: t._count.id,
        };
      }),
    );

    const result: GarmentTypeWithAnalytics = {
      ...garment,
      marginAmount: garment.customerPrice - garment.employeeRate,
      marginPercentage:
        garment.customerPrice > 0
          ? Math.round(
              ((garment.customerPrice - garment.employeeRate) /
                garment.customerPrice) *
                100,
            )
          : 0,
      priceLogs: (garment.priceLogs || []).map((log) => ({
        ...log,
        changedBy: { name: log.changedBy.name },
      })),
      measurementCategories: (garment.measurementCategories || []).map(
        (cat) => ({
          ...cat,
          fields: (cat.fields || []).map((f) => ({
            ...f,
            fieldType: toSharedFieldType(f.fieldType),
          })),
          sections: cat.sections || [],
        }),
      ),
      workflowSteps: garment.workflowSteps || [],
      analytics: {
        totalOrders: orderStats._count.id,
        activeOrders: activeOrdersCount,
        totalRevenue: orderStats._sum.unitPrice || 0,
        totalPayout: orderStats._sum.employeeRate || 0,
        avgActualPrice:
          orderStats._count.id > 0
            ? Math.round(
                (orderStats._sum.unitPrice || 0) / orderStats._count.id,
              )
            : garment.customerPrice,
        topTailors,
      },
    };

    return result;
  }

  async createGarmentType(dto: CreateGarmentTypeDto) {
    const { measurementCategoryIds, ...data } = dto;
    return this.prisma.garmentType.create({
      data: {
        ...data,
        measurementCategories: measurementCategoryIds
          ? {
              connect: measurementCategoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async updateGarmentType(
    id: string,
    dto: UpdateGarmentTypeDto,
    userId: string,
  ) {
    const current = await this.prisma.garmentType.findUniqueOrThrow({
      where: { id },
    });
    const { measurementCategoryIds, ...data } = dto;

    const result = await this.prisma.garmentType.update({
      where: { id },
      data: {
        ...data,
        measurementCategories: measurementCategoryIds
          ? {
              set: measurementCategoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Create log if price changed
    if (
      (dto.customerPrice !== undefined &&
        dto.customerPrice !== current.customerPrice) ||
      (dto.employeeRate !== undefined &&
        dto.employeeRate !== current.employeeRate)
    ) {
      await this.prisma.garmentPriceLog.create({
        data: {
          garmentType: { connect: { id } },
          changedBy: { connect: { id: userId } },
          oldCustomerPrice: current.customerPrice,
          oldEmployeeRate: current.employeeRate,
          newCustomerPrice: dto.customerPrice ?? current.customerPrice,
          newEmployeeRate: dto.employeeRate ?? current.employeeRate,
          action: 'UPDATE',
        },
      });
    }

    return result;
  }

  async deleteGarmentType(id: string) {
    await this.prisma.garmentType.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
    return this.prisma.garmentType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async updateGarmentWorkflowSteps(
    garmentTypeId: string,
    dto: UpdateGarmentWorkflowStepsDto,
  ) {
    await this.prisma.garmentType.findUniqueOrThrow({
      where: { id: garmentTypeId, deletedAt: null },
    });

    const normalizedSteps = dto.steps.map((step, index) => {
      const stepKey = step.stepKey.trim().toUpperCase();
      const stepName = step.stepName.trim();

      if (!/^[A-Z0-9_]+$/.test(stepKey)) {
        throw new BadRequestException(
          `Invalid stepKey at position ${index + 1}. Use only A-Z, 0-9, and _.`,
        );
      }

      if (!stepName) {
        throw new BadRequestException(
          `stepName is required at position ${index + 1}.`,
        );
      }

      if (!Number.isInteger(step.sortOrder) || step.sortOrder < 1) {
        throw new BadRequestException(
          `sortOrder must be a positive integer at position ${index + 1}.`,
        );
      }

      return {
        ...step,
        stepKey,
        stepName,
      };
    });

    const seenStepKeys = new Set<string>();
    for (const step of normalizedSteps) {
      if (seenStepKeys.has(step.stepKey)) {
        throw new BadRequestException(
          `Duplicate stepKey "${step.stepKey}" is not allowed.`,
        );
      }
      seenStepKeys.add(step.stepKey);
    }

    return this.prisma.$transaction(async (tx) => {
      // Soft delete existing active steps not in the incoming payload (if needed, or just hard delete if they haven't been used, but soft delete is safer)
      await tx.workflowStepTemplate.updateMany({
        where: { garmentTypeId },
        data: { deletedAt: new Date(), isActive: false },
      });

      // Insert or Update the incoming steps
      for (const step of normalizedSteps) {
        await tx.workflowStepTemplate.upsert({
          where: {
            garmentTypeId_stepKey: { garmentTypeId, stepKey: step.stepKey },
          },
          update: {
            stepName: step.stepName,
            sortOrder: step.sortOrder,
            isRequired: step.isRequired ?? true,
            isActive: step.isActive ?? true,
            deletedAt: null, // Restore if previously soft deleted
          },
          create: {
            garmentTypeId: garmentTypeId,
            stepKey: step.stepKey,
            stepName: step.stepName,
            sortOrder: step.sortOrder,
            isRequired: step.isRequired ?? true,
            isActive: step.isActive ?? true,
          },
        });
      }

      return tx.workflowStepTemplate.findMany({
        where: { garmentTypeId, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  }

  async getGarmentStats() {
    const [totalCount, activeProduction, prices] = await Promise.all([
      this.prisma.garmentType.count({ where: { deletedAt: null } }),
      this.prisma.garmentType.count({
        where: { deletedAt: null, isActive: true },
      }),
      this.prisma.garmentType.findMany({
        where: { deletedAt: null },
        select: { customerPrice: true },
      }),
    ]);

    const avgRetailPrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p.customerPrice, 0) / prices.length
        : 0;

    return {
      totalCount,
      avgRetailPrice,
      activeProduction,
    };
  }

  async getGarmentPriceHistory(garmentTypeId: string) {
    return this.prisma.garmentPriceLog.findMany({
      where: { garmentTypeId },
      orderBy: { createdAt: 'desc' },
      include: {
        changedBy: { select: { name: true, email: true } },
        garmentType: { select: { name: true } },
      },
    });
  }

  // --- Measurement Categories & Fields ---
  private async getNextSectionSortOrder(categoryId: string) {
    const aggregate = await this.prisma.measurementSection.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    return (aggregate._max.sortOrder ?? -1) + 1;
  }

  private async ensureDefaultMeasurementSection(categoryId: string) {
    const existingDefault = await this.prisma.measurementSection.findFirst({
      where: {
        categoryId,
        name: { equals: 'General', mode: 'insensitive' },
      },
    });

    if (existingDefault) {
      return existingDefault;
    }

    const nextSortOrder = await this.getNextSectionSortOrder(categoryId);
    return this.prisma.measurementSection.create({
      data: {
        categoryId,
        name: 'General',
        sortOrder: nextSortOrder,
      },
    });
  }

  private async resolveMeasurementSection(
    categoryId: string,
    sectionId?: string,
    sectionName?: string,
  ) {
    const normalizedSectionId = sectionId?.trim();
    if (normalizedSectionId) {
      const section = await this.prisma.measurementSection.findUnique({
        where: { id: normalizedSectionId },
      });

      if (!section || section.categoryId !== categoryId) {
        throw new NotFoundException('Measurement section not found.');
      }

      return section;
    }

    const normalizedSectionName = sectionName?.trim();
    if (normalizedSectionName) {
      const existing = await this.prisma.measurementSection.findFirst({
        where: {
          categoryId,
          name: { equals: normalizedSectionName, mode: 'insensitive' },
        },
      });

      if (existing) {
        return existing;
      }

      const nextSortOrder = await this.getNextSectionSortOrder(categoryId);
      return this.prisma.measurementSection.create({
        data: {
          categoryId,
          name: normalizedSectionName,
          sortOrder: nextSortOrder,
        },
      });
    }

    return this.ensureDefaultMeasurementSection(categoryId);
  }

  async getMeasurementCategories(
    options: { search?: string; page?: number; limit?: number } = {},
  ) {
    const { search, page = 1, limit = 10 } = options;
    const pagination = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
      maxLimit: 100,
    });

    const where: Prisma.MeasurementCategoryWhereInput = {
      isActive: true,
      deletedAt: null,
    };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [total, data] = await Promise.all([
      this.prisma.measurementCategory.count({ where }),
      this.prisma.measurementCategory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          sections: {
            orderBy: { sortOrder: 'asc' },
          },
          fields: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: {
              section: true,
            },
          },
        },
      }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getMeasurementCategory(id: string) {
    const category = await this.prisma.measurementCategory.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
        },
        fields: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            section: true,
          },
        },
      },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException('Measurement category not found');
    }

    return category;
  }

  async getMeasurementStats() {
    const [totalCategories, activeCategories, totalFields, requiredFields] =
      await Promise.all([
        this.prisma.measurementCategory.count({
          where: { deletedAt: null },
        }),
        this.prisma.measurementCategory.count({
          where: { deletedAt: null, isActive: true },
        }),
        this.prisma.measurementField.count({
          where: {
            deletedAt: null,
            category: { deletedAt: null },
          },
        }),
        this.prisma.measurementField.count({
          where: {
            deletedAt: null,
            isRequired: true,
            category: { deletedAt: null },
          },
        }),
      ]);

    return {
      totalCategories,
      activeCategories,
      totalFields,
      requiredFields,
    };
  }

  async createMeasurementCategory(dto: CreateMeasurementCategoryDto) {
    const { fields, ...data } = dto;

    const createData: Prisma.MeasurementCategoryCreateInput = {
      ...data,
      name: data.name,
      fields: fields
        ? {
            create: fields.map((f) => ({
              label: f.label,
              fieldType: f.fieldType,
              unit: f.unit,
              isRequired: f.isRequired,
              sortOrder: f.sortOrder,
              dropdownOptions: f.dropdownOptions,
            })),
          }
        : undefined,
    };

    const category = await this.prisma.measurementCategory.create({
      data: createData,
    });

    const defaultSection = await this.ensureDefaultMeasurementSection(category.id);
    await this.prisma.measurementField.updateMany({
      where: { categoryId: category.id, sectionId: null, deletedAt: null },
      data: { sectionId: defaultSection.id },
    });

    return this.getMeasurementCategory(category.id);
  }

  async updateMeasurementCategory(
    id: string,
    dto: UpdateMeasurementCategoryDto,
  ) {
    await this.prisma.measurementCategory.findUniqueOrThrow({ where: { id } });
    // For now, we only update the category details.
    // MeasurementCategoryDialog specifically handles CATEGORY edit,
    // and MeasurementCategoryDetail handles FIELD edits separately.
    // However, the user wants "Save Category" to work when fields are present.
    await this.prisma.measurementCategory.update({
      where: { id },
      data: dto,
    });
    return this.getMeasurementCategory(id);
  }

  async addMeasurementSection(
    categoryId: string,
    dto: CreateMeasurementSectionDto,
  ) {
    const category = await this.prisma.measurementCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException('Measurement category not found');
    }

    const normalizedName = dto.name.trim();
    if (!normalizedName) {
      throw new BadRequestException('Section name is required.');
    }
    const duplicate = await this.prisma.measurementSection.findFirst({
      where: {
        categoryId,
        name: { equals: normalizedName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new ConflictException(
        `Section "${normalizedName}" already exists in this category.`,
      );
    }

    const nextSortOrder =
      dto.sortOrder ?? (await this.getNextSectionSortOrder(categoryId));
    return this.prisma.measurementSection.create({
      data: {
        categoryId,
        name: normalizedName,
        sortOrder: nextSortOrder,
      },
    });
  }

  async addMeasurementField(
    categoryId: string,
    dto: CreateMeasurementFieldDto,
  ) {
    const label = dto.label.trim();
    if (!label) {
      throw new BadRequestException('Field label is required.');
    }
    const category = await this.prisma.measurementCategory.findUniqueOrThrow({
      where: { id: categoryId },
      include: { fields: { where: { deletedAt: null } } },
    });

    const isDuplicate = category.fields.some(
      (f) => f.label.toLowerCase() === label.toLowerCase(),
    );
    if (isDuplicate) {
      throw new ConflictException(
        `A field with label "${label}" already exists in this category.`,
      );
    }

    const section = await this.resolveMeasurementSection(
      categoryId,
      dto.sectionId,
      dto.sectionName,
    );

    const { sectionId: _sectionId, sectionName: _sectionName, ...rest } = dto;
    return this.prisma.measurementField.create({
      data: {
        ...rest,
        label,
        categoryId,
        sectionId: section.id,
      },
    });
  }

  async updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto) {
    const field = await this.prisma.measurementField.findUniqueOrThrow({
      where: { id },
    });

    if (dto.label) {
      const label = dto.label.trim();
      if (!label) {
        throw new BadRequestException('Field label is required.');
      }
      const category = await this.prisma.measurementCategory.findUniqueOrThrow({
        where: { id: field.categoryId },
        include: { fields: { where: { deletedAt: null, NOT: { id } } } },
      });

      const isDuplicate = category.fields.some(
        (f) => f.label.toLowerCase() === label.toLowerCase(),
      );
      if (isDuplicate) {
        throw new ConflictException(
          `A field with label "${label}" already exists in this category.`,
        );
      }
    }

    let resolvedSectionId: string | undefined;
    if (dto.sectionId !== undefined || dto.sectionName !== undefined) {
      const section = await this.resolveMeasurementSection(
        field.categoryId,
        dto.sectionId,
        dto.sectionName,
      );
      resolvedSectionId = section.id;
    }

    const { sectionId: _sectionId, sectionName: _sectionName, ...rest } = dto;
    return this.prisma.measurementField.update({
      where: { id },
      data: {
        ...rest,
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(resolvedSectionId ? { sectionId: resolvedSectionId } : {}),
      },
    });
  }

  async deleteMeasurementField(id: string) {
    await this.prisma.measurementField.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
    return this.prisma.measurementField.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async deleteMeasurementCategory(id: string) {
    await this.prisma.measurementCategory.findUniqueOrThrow({
      where: { id, deletedAt: null },
    });
    return this.prisma.measurementCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
