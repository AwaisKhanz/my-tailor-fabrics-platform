import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateCardInput } from '@tbms/shared-types';
import { Prisma } from '@prisma/client';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSearchOr(search?: string): Prisma.RateCardWhereInput['OR'] {
    const searchTerm = search?.trim();
    if (!searchTerm) {
      return undefined;
    }

    return [
      { stepKey: { contains: searchTerm, mode: 'insensitive' } },
      {
        garmentType: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
      },
    ];
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
    if (Number.isNaN(effectiveFrom.getTime())) {
      throw new BadRequestException('Invalid effectiveFrom date');
    }

    return this.prisma.$transaction(async (tx) => {
      // Close previous rate if it exists and has no effectiveTo
      const previousRate = await tx.rateCard.findFirst({
        where: {
          branchId: dto.branchId ?? null,
          garmentTypeId: dto.garmentTypeId,
          stepKey: dto.stepKey,
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
          stepKey: dto.stepKey,
          amount: dto.amount,
          effectiveFrom,
          stepTemplateId: dto.stepTemplateId,
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
    const page =
      Number.isFinite(options.page) && (options.page ?? 0) > 0
        ? Math.trunc(options.page as number)
        : DEFAULT_PAGE;
    const limit =
      Number.isFinite(options.limit) && (options.limit ?? 0) > 0
        ? Math.min(Math.trunc(options.limit as number), MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;
    const where: Prisma.RateCardWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      OR: this.buildSearchOr(search),
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
        skip,
        take: limit,
      }),
    ]);

    return { data, total, page, limit, lastPage: Math.ceil(total / limit) };
  }

  async getStats(options: { branchId?: string | null; search?: string } = {}) {
    const searchOr = this.buildSearchOr(options.search);

    const scopedWhere: Prisma.RateCardWhereInput = {
      deletedAt: null,
      ...(options.branchId ? { branchId: options.branchId } : {}),
      OR: searchOr,
    };

    const total = await this.prisma.rateCard.count({ where: scopedWhere });

    if (options.branchId) {
      return {
        total,
        global: 0,
        branchScoped: total,
      };
    }

    const [global, branchScoped] = await Promise.all([
      this.prisma.rateCard.count({
        where: {
          deletedAt: null,
          branchId: null,
          OR: searchOr,
        },
      }),
      this.prisma.rateCard.count({
        where: {
          deletedAt: null,
          NOT: { branchId: null },
          OR: searchOr,
        },
      }),
    ]);

    return { total, global, branchScoped };
  }
}
