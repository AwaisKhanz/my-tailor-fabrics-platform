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
  archiveRemovedWorkflowStepDependents,
  assertNoOpenTasksForRemovedWorkflowSteps,
  buildWorkflowStepTemplateUpsertArgs,
  getRemovedWorkflowStepKeys,
  normalizeWorkflowSteps,
} from './garment-workflow-step-planner';
import {
  ensureDefaultMeasurementSection,
  getNextSectionSortOrder,
  resolveMeasurementSection,
} from './measurement-section-resolver';
import {
  assertUniqueMeasurementSectionName,
  buildMeasurementSectionArchiveResponse,
  normalizeMeasurementSectionName,
  resolveMeasurementSectionArchivePlan,
  toMeasurementSectionCreateInput,
  toMeasurementSectionUpdateInput,
} from './measurement-section-management';
import {
  assertUniqueMeasurementFieldLabel,
  buildMeasurementFieldArchiveResponse,
  normalizeMeasurementFieldLabel,
  resolveMeasurementFieldArchivePlan,
  toMeasurementFieldCreateInput,
  toMeasurementFieldUpdateInput,
} from './measurement-field-management';
import {
  buildMeasurementCategoryArchiveResponse,
  resolveMeasurementCategoryArchivePlan,
  toMeasurementCategoryCreateInput,
  toMeasurementCategoryUpdateInput,
} from './measurement-category-management';
import {
  GarmentTypeWithAnalytics,
  ItemStatus,
  SystemSettings,
  TaskStatus,
} from '@tbms/shared-types';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';
import {
  buildTopTailors,
  getGarmentTypeDetailInclude,
  toGarmentTypeWithAnalytics,
} from './garment-analytics';
import {
  buildGarmentTypeCreateData,
  buildGarmentTypeUpdateData,
} from './garment-type-write';

const MAX_CONFIG_TRANSACTION_RETRIES = 3;

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private isSerializationConflict(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    );
  }

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
      include: getGarmentTypeDetailInclude(),
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
          AND oit.status = ${TaskStatus.DONE}
          AND o."deletedAt" IS NULL
      `,
    );
    const totalPayoutFromTasks = Number(
      totalPayoutFromTasksResult[0]?.total ?? 0,
    );

    const activeOrdersCount = await this.prisma.orderItem.count({
      where: {
        garmentTypeId: id,
        status: { in: [ItemStatus.PENDING, ItemStatus.IN_PROGRESS] },
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
          AND oit."status" = ${TaskStatus.DONE}
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
    const topTailors = buildTopTailors(topTailorsData, employees);

    return toGarmentTypeWithAnalytics({
      garment,
      orderCount: orderStats._count.id,
      orderRevenue: orderStats._sum.unitPrice || 0,
      activeOrdersCount,
      totalPayoutFromTasks,
      topTailors,
    });
  }

  async createGarmentType(dto: CreateGarmentTypeDto) {
    return this.prisma.garmentType.create({
      data: buildGarmentTypeCreateData(dto),
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
      const result = await tx.garmentType.update({
        where: { id },
        data: buildGarmentTypeUpdateData(dto),
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

    const normalizedSteps = normalizeWorkflowSteps(dto.steps);

    const existingSteps = await this.prisma.workflowStepTemplate.findMany({
      where: {
        garmentTypeId,
        deletedAt: null,
      },
      select: {
        stepKey: true,
      },
    });

    const removedStepKeys = getRemovedWorkflowStepKeys(
      existingSteps,
      normalizedSteps,
    );
    await assertNoOpenTasksForRemovedWorkflowSteps(
      this.prisma,
      garmentTypeId,
      removedStepKeys,
    );

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();

      await tx.workflowStepTemplate.updateMany({
        where: { garmentTypeId },
        data: { deletedAt: now, isActive: false },
      });

      // Insert or Update the incoming steps
      for (const step of normalizedSteps) {
        await tx.workflowStepTemplate.upsert(
          buildWorkflowStepTemplateUpsertArgs({
            garmentTypeId,
            step,
          }),
        );
      }

      await archiveRemovedWorkflowStepDependents(
        tx,
        garmentTypeId,
        removedStepKeys,
        now,
      );

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
    const categoryId = await this.prisma.$transaction(async (tx) => {
      const category = await tx.measurementCategory.create({
        data: toMeasurementCategoryCreateInput(dto),
      });

      const defaultSection = await ensureDefaultMeasurementSection(
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
      data: toMeasurementCategoryUpdateInput(dto),
    });
    return this.getMeasurementCategory(id);
  }

  async addMeasurementSection(
    categoryId: string,
    dto: CreateMeasurementSectionDto,
  ) {
    const normalizedName = normalizeMeasurementSectionName(dto.name);

    for (
      let attempt = 1;
      attempt <= MAX_CONFIG_TRANSACTION_RETRIES;
      attempt += 1
    ) {
      try {
        return await this.prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            const category = await tx.measurementCategory.findUnique({
              where: { id: categoryId },
            });

            if (!category || category.deletedAt) {
              throw new NotFoundException('Measurement category not found');
            }

            await assertUniqueMeasurementSectionName(tx, {
              categoryId,
              name: normalizedName,
            });

            const nextSortOrder =
              dto.sortOrder ??
              (await getNextSectionSortOrder(categoryId, tx));

            return tx.measurementSection.create({
              data: toMeasurementSectionCreateInput({
                categoryId,
                name: normalizedName,
                sortOrder: nextSortOrder,
              }),
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          this.isSerializationConflict(error) &&
          attempt < MAX_CONFIG_TRANSACTION_RETRIES
        ) {
          continue;
        }

        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Concurrent measurement section update detected. Please retry.',
          );
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Unable to create measurement section at this time.',
    );
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

    if (dto.name !== undefined) {
      const normalizedName = normalizeMeasurementSectionName(dto.name);
      await assertUniqueMeasurementSectionName(this.prisma, {
        categoryId: section.categoryId,
        name: normalizedName,
        excludeSectionId: sectionId,
      });
    }

    const data = toMeasurementSectionUpdateInput(dto);

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
    const { section, activeFieldCount, blockedReasons, targetSection } =
      await resolveMeasurementSectionArchivePlan(
        this.prisma,
        sectionId,
        dto.targetSectionId,
      );

    if (preview) {
      return buildMeasurementSectionArchiveResponse({
        blockedReasons,
        activeFieldCount,
        deletedSectionId: sectionId,
        targetSectionId: targetSection?.id ?? null,
      });
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

      return buildMeasurementSectionArchiveResponse({
        blockedReasons: [],
        activeFieldCount,
        deletedSectionId: sectionId,
        targetSectionId: targetSection.id,
      });
    }

    await this.prisma.measurementSection.update({
      where: { id: sectionId },
      data: { deletedAt: new Date() },
    });

    return buildMeasurementSectionArchiveResponse({
      blockedReasons: [],
      activeFieldCount: 0,
      deletedSectionId: sectionId,
      targetSectionId: null,
    });
  }

  async addMeasurementField(
    categoryId: string,
    dto: CreateMeasurementFieldDto,
  ) {
    const label = normalizeMeasurementFieldLabel(dto.label);

    return this.prisma.$transaction(async (tx) => {
      await tx.measurementCategory.findFirstOrThrow({
        where: { id: categoryId, deletedAt: null },
      });

      await assertUniqueMeasurementFieldLabel(tx, {
        categoryId,
        label,
      });

      const section = await resolveMeasurementSection(
        categoryId,
        tx,
        dto.sectionId,
        dto.sectionName,
      );

      return tx.measurementField.create({
        data: toMeasurementFieldCreateInput({
          dto: { ...dto, label },
          categoryId,
          sectionId: section.id,
        }),
      });
    });
  }

  async updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto) {
    return this.prisma.$transaction(async (tx) => {
      const field = await tx.measurementField.findFirstOrThrow({
        where: { id, deletedAt: null },
      });

      if (dto.label) {
        const label = normalizeMeasurementFieldLabel(dto.label);
        await assertUniqueMeasurementFieldLabel(tx, {
          categoryId: field.categoryId,
          label,
          excludeFieldId: id,
        });
      }

      let resolvedSectionId: string | undefined;
      if (dto.sectionId !== undefined || dto.sectionName !== undefined) {
        const section = await resolveMeasurementSection(
          field.categoryId,
          tx,
          dto.sectionId,
          dto.sectionName,
        );
        resolvedSectionId = section.id;
      }

      return tx.measurementField.update({
        where: { id },
        data: toMeasurementFieldUpdateInput({
          dto,
          sectionId: resolvedSectionId,
        }),
      });
    });
  }

  async deleteMeasurementField(id: string, preview = false) {
    const { field, customerMeasurementCount } =
      await resolveMeasurementFieldArchivePlan(this.prisma, id);

    if (preview) {
      return buildMeasurementFieldArchiveResponse({
        archivedFieldId: id,
        customerMeasurementCount,
      });
    }

    await this.prisma.measurementField.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return buildMeasurementFieldArchiveResponse({
      archivedFieldId: id,
      customerMeasurementCount,
    });
  }

  async deleteMeasurementCategory(id: string, preview = false) {
    const { category, historicalMeasurementCount } =
      await resolveMeasurementCategoryArchivePlan(this.prisma, id);

    if (preview) {
      return buildMeasurementCategoryArchiveResponse({
        category,
        historicalMeasurementCount,
        archivedCategoryId: id,
      });
    }

    await this.prisma.measurementCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return buildMeasurementCategoryArchiveResponse({
      category,
      historicalMeasurementCount,
      archivedCategoryId: id,
    });
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
