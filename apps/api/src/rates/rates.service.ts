import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateCardInput } from '@tbms/shared-types';
import { Prisma } from '@prisma/client';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSearchWhere(
    search?: string,
  ): Prisma.RateCardWhereInput | undefined {
    const searchTerm = search?.trim();
    if (!searchTerm) {
      return undefined;
    }

    return {
      OR: [
        { stepKey: { contains: searchTerm, mode: 'insensitive' } },
        {
          garmentType: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    };
  }

  async findEffectiveRate(
    branchId: string,
    garmentTypeId: string,
    stepKey: string,
    date: Date = new Date(),
  ) {
    // 1. Try branch-specific rate
    let rateCard = await this.prisma.rateCard.findFirst({
      where: {
        branchId,
        garmentTypeId,
        stepKey,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
        deletedAt: null,
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    // 2. Fallback to global rate if not found
    if (!rateCard) {
      rateCard = await this.prisma.rateCard.findFirst({
        where: {
          branchId: null,
          garmentTypeId,
          stepKey,
          effectiveFrom: { lte: date },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
          deletedAt: null,
        },
        orderBy: { effectiveFrom: 'desc' },
      });
    }

    return rateCard;
  }

  async create(dto: CreateRateCardInput & { createdById: string }) {
    const effectiveFrom = new Date(dto.effectiveFrom);
    const stepKey = dto.stepKey.trim().toUpperCase();
    if (Number.isNaN(effectiveFrom.getTime())) {
      throw new BadRequestException('Invalid effectiveFrom date');
    }

    return this.prisma.$transaction(async (tx) => {
      const garmentType = await tx.garmentType.findFirst({
        where: {
          id: dto.garmentTypeId,
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      });

      if (!garmentType) {
        throw new BadRequestException(
          'Cannot create rate for an archived or inactive garment type.',
        );
      }

      const stepTemplate = await tx.workflowStepTemplate.findFirst({
        where: {
          garmentTypeId: dto.garmentTypeId,
          stepKey,
          deletedAt: null,
          isActive: true,
        },
      });

      if (!stepTemplate) {
        throw new BadRequestException(
          `Invalid stepKey "${stepKey}" for this garment.`,
        );
      }

      if (dto.stepTemplateId && dto.stepTemplateId !== stepTemplate.id) {
        throw new BadRequestException(
          'stepTemplateId does not match the selected garment step.',
        );
      }

      // Close previous rate if it exists and has no effectiveTo
      const previousRate = await tx.rateCard.findFirst({
        where: {
          branchId: dto.branchId ?? null,
          garmentTypeId: dto.garmentTypeId,
          stepKey,
          effectiveTo: null,
          deletedAt: null,
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      if (previousRate) {
        if (effectiveFrom <= previousRate.effectiveFrom) {
          throw new BadRequestException(
            'effectiveFrom must be after the current active rate start date',
          );
        }
        // Set previous rate's effectiveTo to the new rate's effectiveFrom
        await tx.rateCard.update({
          where: { id: previousRate.id },
          data: { effectiveTo: effectiveFrom },
        });
      }

      return tx.rateCard.create({
        data: {
          branchId: dto.branchId,
          garmentTypeId: dto.garmentTypeId,
          stepKey,
          amount: dto.amount,
          effectiveFrom,
          stepTemplateId: dto.stepTemplateId ?? stepTemplate.id,
          createdById: dto.createdById,
        },
      });
    });
  }

  async getHistory(garmentTypeId: string, stepKey: string, branchId?: string) {
    return this.prisma.rateCard.findMany({
      where: {
        garmentTypeId,
        stepKey,
        ...(branchId === undefined ? {} : { branchId: branchId || null }),
        deletedAt: null,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findAll(
    options: {
      branchId?: string | null;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { branchId, search } = options;
    const filters: Prisma.RateCardWhereInput[] = [];

    if (branchId) {
      filters.push({
        OR: [{ branchId }, { branchId: null }],
      });
    }

    const searchWhere = this.buildSearchWhere(search);
    if (searchWhere) {
      filters.push(searchWhere);
    }

    const pagination = normalizePagination({
      page: options.page,
      limit: options.limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });

    const where: Prisma.RateCardWhereInput = {
      deletedAt: null,
      ...(filters.length > 0 ? { AND: filters } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.rateCard.count({ where }),
      this.prisma.rateCard.findMany({
        where,
        include: {
          garmentType: { select: { name: true } },
          branch: { select: { name: true, code: true } },
        },
        orderBy: [
          { garmentType: { name: 'asc' } },
          { stepKey: 'asc' },
          { effectiveFrom: 'desc' },
        ],
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getStats(options: { branchId?: string | null; search?: string } = {}) {
    const searchWhere = this.buildSearchWhere(options.search);

    if (options.branchId) {
      const branchScopedWhere: Prisma.RateCardWhereInput = {
        deletedAt: null,
        branchId: options.branchId,
        ...(searchWhere ? { AND: [searchWhere] } : {}),
      };
      const globalWhere: Prisma.RateCardWhereInput = {
        deletedAt: null,
        branchId: null,
        ...(searchWhere ? { AND: [searchWhere] } : {}),
      };

      const [branchScoped, global] = await Promise.all([
        this.prisma.rateCard.count({ where: branchScopedWhere }),
        this.prisma.rateCard.count({ where: globalWhere }),
      ]);

      return {
        total: branchScoped + global,
        global,
        branchScoped,
      };
    }

    const scopedWhere: Prisma.RateCardWhereInput = {
      deletedAt: null,
      ...(searchWhere ? { AND: [searchWhere] } : {}),
    };

    const total = await this.prisma.rateCard.count({ where: scopedWhere });

    const [global, branchScoped] = await Promise.all([
      this.prisma.rateCard.count({
        where: {
          deletedAt: null,
          branchId: null,
          ...(searchWhere ? { AND: [searchWhere] } : {}),
        },
      }),
      this.prisma.rateCard.count({
        where: {
          deletedAt: null,
          NOT: { branchId: null },
          ...(searchWhere ? { AND: [searchWhere] } : {}),
        },
      }),
    ]);

    return { total, global, branchScoped };
  }
}
