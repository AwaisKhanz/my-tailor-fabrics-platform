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
  UpdateMeasurementSectionDto,
  DeleteMeasurementSectionDto,
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

type ConfigPrismaClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveGarmentTypeOrThrow(id: string) {
    const garmentType = await this.prisma.garmentType.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, deletedAt: true, isActive: true },
    });

    if (!garmentType) {
      throw new NotFoundException('Garment type not found.');
    }

    return garmentType;
  }

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
      includeArchived?: boolean;
    } = {},
  ) {
    const { search, page = 1, limit = 10, includeArchived = false } = options;
    const pagination = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
      maxLimit: 100,
    });

    const where: Prisma.GarmentTypeWhereInput = includeArchived
      ? {}
      : {
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
          rateCards: {
            where: {
              deletedAt: null,
              effectiveTo: null,
              branchId: null,
            },
            select: { amount: true },
          },
        },
      }),
    ]);

    const data = types.map((t) => {
      const baselineLabourRate = t.rateCards.reduce(
        (sum, rate) => sum + rate.amount,
        0,
      );
      return {
        ...t,
        marginAmount: t.customerPrice - baselineLabourRate,
        marginPercentage:
          t.customerPrice > 0
            ? Math.round(
                ((t.customerPrice - baselineLabourRate) / t.customerPrice) *
                  100,
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
              where: { deletedAt: null },
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
      _sum: { unitPrice: true },
    });

    const totalPayoutFromTasksResult = await this.prisma.$queryRaw<
      [{ total: bigint }]
    >(
      Prisma.sql`
        SELECT COALESCE(SUM(COALESCE(oit."rateOverride", oit."designRateSnapshot", oit."rateSnapshot", 0)), 0) AS total
        FROM "OrderItemTask" oit
        JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE oi."garmentTypeId" = ${id}
          AND oit."deletedAt" IS NULL
          AND oit.status = 'DONE'
          AND o."deletedAt" IS NULL
      `,
    );
    const totalPayoutFromTasks = Number(
      totalPayoutFromTasksResult[0]?.total ?? 0,
    );

    const activeOrdersCount = await this.prisma.orderItem.count({
      where: {
        garmentTypeId: id,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    });

    // Top Tailors (Efficiency) based on completed workflow tasks.
    const topTailorsData = await this.prisma.$queryRaw<
      Array<{ employeeId: string; count: bigint }>
    >(
      Prisma.sql`
        SELECT
          oit."assignedEmployeeId" AS "employeeId",
          COUNT(*)::bigint AS "count"
        FROM "OrderItemTask" oit
        JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE oi."garmentTypeId" = ${id}
          AND oit."assignedEmployeeId" IS NOT NULL
          AND oit."status" = 'DONE'
          AND oit."deletedAt" IS NULL
          AND oi."deletedAt" IS NULL
          AND o."deletedAt" IS NULL
        GROUP BY oit."assignedEmployeeId"
        ORDER BY COUNT(*) DESC
        LIMIT 3
      `,
    );

    const employeeIds = topTailorsData.map((entry) => entry.employeeId);
    const employees = employeeIds.length
      ? await this.prisma.employee.findMany({
          where: { id: { in: employeeIds } },
          select: { id: true, fullName: true },
        })
      : [];
    const employeeNameMap = new Map(
      employees.map((employee) => [employee.id, employee.fullName]),
    );
    const topTailors = topTailorsData.map((entry) => ({
      name: employeeNameMap.get(entry.employeeId) ?? 'Removed Employee',
      count: Number(entry.count),
    }));

    const globalActiveRateTotal = (garment.rateCards || []).reduce(
      (sum, rate) => sum + (rate.branchId ? 0 : rate.amount),
      0,
    );

    const result: GarmentTypeWithAnalytics = {
      ...garment,
      marginAmount: garment.customerPrice - globalActiveRateTotal,
      marginPercentage:
        garment.customerPrice > 0
          ? Math.round(
              ((garment.customerPrice - globalActiveRateTotal) /
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
        totalPayout: totalPayoutFromTasks,
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
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.garmentType.findFirst({
        where: { id, deletedAt: null },
      });

      if (!current) {
        throw new NotFoundException('Garment type not found.');
      }
      const { measurementCategoryIds, ...data } = dto;

      const result = await tx.garmentType.update({
        where: { id },
        data: {
          ...data,
          measurementCategories: measurementCategoryIds
            ? {
                set: measurementCategoryIds.map((categoryId) => ({
                  id: categoryId,
                })),
              }
            : undefined,
        },
      });

      if (
        dto.customerPrice !== undefined &&
        dto.customerPrice !== current.customerPrice
      ) {
        await tx.garmentPriceLog.create({
          data: {
            garmentType: { connect: { id } },
            changedBy: { connect: { id: userId } },
            oldCustomerPrice: current.customerPrice,
            newCustomerPrice: dto.customerPrice,
            action: 'UPDATE',
          },
        });
      }

      return result;
    });
  }

  async deleteGarmentType(id: string, preview = false) {
    await this.getActiveGarmentTypeOrThrow(id);

    const [workflowStepCount, activeRateCount, linkedOrderItemCount] =
      await Promise.all([
        this.prisma.workflowStepTemplate.count({
          where: { garmentTypeId: id, deletedAt: null },
        }),
        this.prisma.rateCard.count({
          where: {
            garmentTypeId: id,
            deletedAt: null,
            effectiveTo: null,
          },
        }),
        this.prisma.orderItem.count({
          where: {
            garmentTypeId: id,
            deletedAt: null,
            order: { deletedAt: null },
          },
        }),
      ]);

    if (preview) {
      return {
        action: 'ARCHIVE',
        blocked: false,
        blockedReasons: [],
        affected: {
          garments: 1,
          workflowSteps: workflowStepCount,
          activeRates: activeRateCount,
          historicalOrderItems: linkedOrderItemCount,
        },
        archivedGarmentTypeId: id,
      };
    }

    await this.prisma.garmentType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return {
      action: 'ARCHIVE',
      blocked: false,
      blockedReasons: [],
      affected: {
        garments: 1,
        workflowSteps: workflowStepCount,
        activeRates: activeRateCount,
        historicalOrderItems: linkedOrderItemCount,
      },
      archivedGarmentTypeId: id,
    };
  }

  async restoreGarmentType(id: string) {
    const garment = await this.prisma.garmentType.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!garment) {
      throw new NotFoundException('Garment type not found.');
    }

    if (!garment.deletedAt) {
      return garment;
    }

    return this.prisma.garmentType.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  async updateGarmentWorkflowSteps(
    garmentTypeId: string,
    dto: UpdateGarmentWorkflowStepsDto,
  ) {
    await this.getActiveGarmentTypeOrThrow(garmentTypeId);

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

    const existingSteps = await this.prisma.workflowStepTemplate.findMany({
      where: {
        garmentTypeId,
        deletedAt: null,
      },
      select: {
        stepKey: true,
      },
    });

    const incomingStepKeys = new Set(
      normalizedSteps.map((step) => step.stepKey),
    );
    const removedStepKeys = existingSteps
      .map((step) => step.stepKey)
      .filter((stepKey) => !incomingStepKeys.has(stepKey));

    if (removedStepKeys.length > 0) {
      const openTasksCount = await this.prisma.orderItemTask.count({
        where: {
          stepKey: { in: removedStepKeys },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          deletedAt: null,
          orderItem: {
            garmentTypeId,
            deletedAt: null,
            order: {
              deletedAt: null,
            },
          },
        },
      });

      if (openTasksCount > 0) {
        throw new BadRequestException(
          `Cannot remove workflow steps with ${openTasksCount} open task(s). Complete or cancel those tasks first.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.workflowStepTemplate.updateMany({
        where: { garmentTypeId },
        data: { deletedAt: now, isActive: false },
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
            deletedAt: null,
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

      if (removedStepKeys.length > 0) {
        await tx.rateCard.updateMany({
          where: {
            garmentTypeId,
            stepKey: { in: removedStepKeys },
            deletedAt: null,
            effectiveTo: null,
          },
          data: {
            effectiveTo: now,
          },
        });

        await tx.employeeCapability.updateMany({
          where: {
            garmentTypeId,
            stepKey: { in: removedStepKeys },
            deletedAt: null,
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
          },
          data: {
            effectiveTo: now,
            note: 'Auto-closed because the workflow step was archived.',
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
  private async getNextSectionSortOrder(
    categoryId: string,
    client: ConfigPrismaClient = this.prisma,
  ) {
    const aggregate = await client.measurementSection.aggregate({
      where: { categoryId, deletedAt: null },
      _max: { sortOrder: true },
    });
    return (aggregate._max.sortOrder ?? -1) + 1;
  }

  private async ensureDefaultMeasurementSection(
    categoryId: string,
    client: ConfigPrismaClient = this.prisma,
  ) {
    const existingDefault = await client.measurementSection.findFirst({
      where: {
        categoryId,
        deletedAt: null,
        name: { equals: 'General', mode: 'insensitive' },
      },
    });

    if (existingDefault) {
      return existingDefault;
    }

    const nextSortOrder = await this.getNextSectionSortOrder(
      categoryId,
      client,
    );
    return client.measurementSection.create({
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
    client: ConfigPrismaClient = this.prisma,
  ) {
    const normalizedSectionId = sectionId?.trim();
    if (normalizedSectionId) {
      const section = await client.measurementSection.findFirst({
        where: { id: normalizedSectionId, deletedAt: null },
      });

      if (!section || section.categoryId !== categoryId) {
        throw new NotFoundException('Measurement section not found.');
      }

      return section;
    }

    const normalizedSectionName = sectionName?.trim();
    if (normalizedSectionName) {
      const existing = await client.measurementSection.findFirst({
        where: {
          categoryId,
          deletedAt: null,
          name: { equals: normalizedSectionName, mode: 'insensitive' },
        },
      });

      if (existing) {
        return existing;
      }

      const nextSortOrder = await this.getNextSectionSortOrder(
        categoryId,
        client,
      );
      return client.measurementSection.create({
        data: {
          categoryId,
          name: normalizedSectionName,
          sortOrder: nextSortOrder,
        },
      });
    }

    return this.ensureDefaultMeasurementSection(categoryId, client);
  }

  async getMeasurementCategories(
    options: {
      search?: string;
      page?: number;
      limit?: number;
      includeArchived?: boolean;
    } = {},
  ) {
    const { search, page = 1, limit = 10, includeArchived = false } = options;
    const pagination = normalizePagination({
      page,
      limit,
      defaultLimit: 10,
      maxLimit: 100,
    });

    const where: Prisma.MeasurementCategoryWhereInput = includeArchived
      ? {}
      : {
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
          sections: includeArchived
            ? {
                orderBy: { sortOrder: 'asc' },
              }
            : {
                where: { deletedAt: null },
                orderBy: { sortOrder: 'asc' },
              },
          fields: {
            ...(includeArchived ? {} : { where: { deletedAt: null } }),
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

  async getMeasurementCategory(
    id: string,
    options: { includeArchived?: boolean } = {},
  ) {
    const { includeArchived = false } = options;
    const category = await this.prisma.measurementCategory.findUnique({
      where: { id },
      include: {
        sections: includeArchived
          ? {
              orderBy: { sortOrder: 'asc' },
            }
          : {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
            },
        fields: {
          ...(includeArchived ? {} : { where: { deletedAt: null } }),
          orderBy: { sortOrder: 'asc' },
          include: {
            section: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Measurement category not found');
    }

    if (!includeArchived && category.deletedAt) {
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

    const categoryId = await this.prisma.$transaction(async (tx) => {
      const category = await tx.measurementCategory.create({
        data: createData,
      });

      const defaultSection = await this.ensureDefaultMeasurementSection(
        category.id,
        tx,
      );
      await tx.measurementField.updateMany({
        where: { categoryId: category.id, sectionId: null, deletedAt: null },
        data: { sectionId: defaultSection.id },
      });

      return category.id;
    });

    return this.getMeasurementCategory(categoryId);
  }

  async updateMeasurementCategory(
    id: string,
    dto: UpdateMeasurementCategoryDto,
  ) {
    await this.prisma.measurementCategory.findFirstOrThrow({
      where: { id, deletedAt: null },
    });
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
        deletedAt: null,
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

  async updateMeasurementSection(
    sectionId: string,
    dto: UpdateMeasurementSectionDto,
  ) {
    const section = await this.prisma.measurementSection.findFirst({
      where: { id: sectionId, deletedAt: null },
    });

    if (!section) {
      throw new NotFoundException('Measurement section not found.');
    }

    const data: Prisma.MeasurementSectionUpdateInput = {};

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();
      if (!normalizedName) {
        throw new BadRequestException('Section name is required.');
      }

      const duplicate = await this.prisma.measurementSection.findFirst({
        where: {
          categoryId: section.categoryId,
          deletedAt: null,
          id: { not: sectionId },
          name: { equals: normalizedName, mode: 'insensitive' },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Section "${normalizedName}" already exists in this category.`,
        );
      }

      data.name = normalizedName;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    if (Object.keys(data).length === 0) {
      return section;
    }

    return this.prisma.measurementSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteMeasurementSection(
    sectionId: string,
    dto: DeleteMeasurementSectionDto = {},
    preview = false,
  ) {
    const section = await this.prisma.measurementSection.findUnique({
      where: { id: sectionId },
      include: {
        category: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!section || section.deletedAt || section.category.deletedAt) {
      throw new NotFoundException('Measurement section not found.');
    }

    const activeFieldCount = await this.prisma.measurementField.count({
      where: { sectionId, deletedAt: null },
    });

    const targetSectionId = dto.targetSectionId?.trim();
    const blockedReasons: { code: string; message: string }[] = [];

    let targetSection: {
      id: string;
      categoryId: string;
    } | null = null;

    if (activeFieldCount > 0) {
      if (!targetSectionId) {
        blockedReasons.push({
          code: 'TARGET_SECTION_REQUIRED',
          message:
            'Target section is required to move fields before archiving this section.',
        });
      }

      if (targetSectionId && targetSectionId === sectionId) {
        blockedReasons.push({
          code: 'TARGET_SECTION_INVALID',
          message:
            'Target section must be different from the section being archived.',
        });
      }

      if (targetSectionId && targetSectionId !== sectionId) {
        targetSection = await this.prisma.measurementSection.findFirst({
          where: { id: targetSectionId, deletedAt: null },
          select: { id: true, categoryId: true },
        });

        if (!targetSection || targetSection.categoryId !== section.categoryId) {
          blockedReasons.push({
            code: 'TARGET_SECTION_NOT_FOUND',
            message:
              'Target measurement section was not found in this category.',
          });
        }
      }
    }

    if (preview) {
      return {
        action: 'ARCHIVE',
        blocked: blockedReasons.length > 0,
        blockedReasons,
        affected: {
          sections: 1,
          movedFields: blockedReasons.length > 0 ? 0 : activeFieldCount,
        },
        deletedSectionId: sectionId,
        movedFieldCount: blockedReasons.length > 0 ? 0 : activeFieldCount,
        targetSectionId: targetSection?.id ?? null,
      };
    }

    if (blockedReasons.length > 0) {
      throw new BadRequestException(blockedReasons[0].message);
    }

    if (activeFieldCount > 0 && targetSection?.id) {
      await this.prisma.$transaction([
        this.prisma.measurementField.updateMany({
          where: { sectionId, deletedAt: null },
          data: { sectionId: targetSection.id },
        }),
        this.prisma.measurementSection.update({
          where: { id: sectionId },
          data: { deletedAt: new Date() },
        }),
      ]);

      return {
        action: 'ARCHIVE',
        blocked: false,
        blockedReasons: [],
        affected: {
          sections: 1,
          movedFields: activeFieldCount,
        },
        deletedSectionId: sectionId,
        movedFieldCount: activeFieldCount,
        targetSectionId: targetSection.id,
      };
    }

    await this.prisma.measurementSection.update({
      where: { id: sectionId },
      data: { deletedAt: new Date() },
    });

    return {
      action: 'ARCHIVE',
      blocked: false,
      blockedReasons: [],
      affected: {
        sections: 1,
        movedFields: 0,
      },
      deletedSectionId: sectionId,
      movedFieldCount: 0,
      targetSectionId: null,
    };
  }

  async addMeasurementField(
    categoryId: string,
    dto: CreateMeasurementFieldDto,
  ) {
    const label = dto.label.trim();
    if (!label) {
      throw new BadRequestException('Field label is required.');
    }
    const category = await this.prisma.measurementCategory.findFirstOrThrow({
      where: { id: categoryId, deletedAt: null },
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

    return this.prisma.measurementField.create({
      data: {
        label,
        ...(dto.fieldType !== undefined ? { fieldType: dto.fieldType } : {}),
        ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
        ...(dto.dropdownOptions !== undefined
          ? { dropdownOptions: dto.dropdownOptions }
          : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        categoryId,
        sectionId: section.id,
      },
    });
  }

  async updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto) {
    const field = await this.prisma.measurementField.findFirstOrThrow({
      where: { id, deletedAt: null },
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

    return this.prisma.measurementField.update({
      where: { id },
      data: {
        ...(dto.fieldType !== undefined ? { fieldType: dto.fieldType } : {}),
        ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
        ...(dto.dropdownOptions !== undefined
          ? { dropdownOptions: dto.dropdownOptions }
          : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(resolvedSectionId ? { sectionId: resolvedSectionId } : {}),
      },
    });
  }

  async deleteMeasurementField(id: string, preview = false) {
    const field = await this.prisma.measurementField.findFirstOrThrow({
      where: { id, deletedAt: null },
      select: { id: true, categoryId: true },
    });

    const customerMeasurementCount =
      await this.prisma.customerMeasurement.count({
        where: { categoryId: field.categoryId },
      });

    if (preview) {
      return {
        action: 'ARCHIVE',
        blocked: false,
        blockedReasons: [],
        affected: {
          fields: 1,
          historicalCustomerMeasurements: customerMeasurementCount,
        },
        archivedFieldId: id,
      };
    }

    await this.prisma.measurementField.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      action: 'ARCHIVE',
      blocked: false,
      blockedReasons: [],
      affected: {
        fields: 1,
        historicalCustomerMeasurements: customerMeasurementCount,
      },
      archivedFieldId: id,
    };
  }

  async deleteMeasurementCategory(id: string, preview = false) {
    const category = await this.prisma.measurementCategory.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: {
        garmentTypes: {
          where: { deletedAt: null },
          select: { id: true },
        },
        fields: {
          where: { deletedAt: null },
          select: { id: true },
        },
        sections: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    const historicalMeasurementCount =
      await this.prisma.customerMeasurement.count({
        where: { categoryId: id },
      });

    if (preview) {
      return {
        action: 'ARCHIVE',
        blocked: false,
        blockedReasons: [],
        affected: {
          categories: 1,
          linkedGarments: category.garmentTypes.length,
          activeSections: category.sections.length,
          activeFields: category.fields.length,
          historicalCustomerMeasurements: historicalMeasurementCount,
        },
        archivedCategoryId: id,
      };
    }

    await this.prisma.measurementCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return {
      action: 'ARCHIVE',
      blocked: false,
      blockedReasons: [],
      affected: {
        categories: 1,
        linkedGarments: category.garmentTypes.length,
        activeSections: category.sections.length,
        activeFields: category.fields.length,
        historicalCustomerMeasurements: historicalMeasurementCount,
      },
      archivedCategoryId: id,
    };
  }

  async restoreMeasurementCategory(id: string) {
    const category = await this.prisma.measurementCategory.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!category) {
      throw new NotFoundException('Measurement category not found.');
    }

    if (!category.deletedAt) {
      return category;
    }

    return this.prisma.measurementCategory.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  async restoreMeasurementField(id: string) {
    const field = await this.prisma.measurementField.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!field) {
      throw new NotFoundException('Measurement field not found.');
    }

    if (!field.deletedAt) {
      return field;
    }

    return this.prisma.measurementField.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async restoreMeasurementSection(id: string) {
    const section = await this.prisma.measurementSection.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!section) {
      throw new NotFoundException('Measurement section not found.');
    }

    if (!section.deletedAt) {
      return section;
    }

    return this.prisma.measurementSection.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async restoreGarmentWorkflowStep(garmentTypeId: string, stepKeyRaw: string) {
    await this.getActiveGarmentTypeOrThrow(garmentTypeId);
    const stepKey = stepKeyRaw.trim().toUpperCase();
    const existing = await this.prisma.workflowStepTemplate.findUnique({
      where: {
        garmentTypeId_stepKey: {
          garmentTypeId,
          stepKey,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Workflow step template not found.');
    }

    return this.prisma.workflowStepTemplate.update({
      where: {
        garmentTypeId_stepKey: {
          garmentTypeId,
          stepKey,
        },
      },
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  }
}
