import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRateCardInput } from '@tbms/shared-types';
import { Prisma } from '@prisma/client';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

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
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
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
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: date } },
          ],
          deletedAt: null,
        },
        orderBy: { effectiveFrom: 'desc' },
      });
    }

    return rateCard;
  }

  async create(dto: CreateRateCardInput & { createdById: string }) {
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
        const effectiveFrom = new Date(dto.effectiveFrom);
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
          effectiveFrom: new Date(dto.effectiveFrom),
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
        branchId: branchId || null,
        deletedAt: null,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findAll(options: { 
    branchId?: string | null, 
    search?: string, 
    page?: number, 
    limit?: number 
  } = {}) {
    const { branchId, search, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.RateCardWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
    };

    if (search) {
      where.OR = [
        { stepKey: { contains: search, mode: 'insensitive' } },
        { garmentType: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

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

    return { data, total };
  }
}
