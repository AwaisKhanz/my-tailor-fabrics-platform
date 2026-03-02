import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerEntryType } from '@tbms/shared-types';
import type { CreateLedgerEntryInput, LedgerSummary } from '@tbms/shared-types';
import { Prisma, LedgerEntryType as PrismaLedgerEntryType } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a single ledger entry.
   * Positive amount = EARNING / SALARY / ADJUSTMENT.
   * Negative amount = PAYOUT / ADVANCE / DEDUCTION.
   */
  async createEntry(dto: CreateLedgerEntryInput) {
    return this.prisma.employeeLedgerEntry.create({
      data: {
        employeeId: dto.employeeId,
        branchId: dto.branchId,
        type: dto.type as PrismaLedgerEntryType,
        amount: dto.amount,
        orderItemTaskId: dto.orderItemTaskId ?? null,
        paymentId: dto.paymentId ?? null,
        createdById: dto.createdById ?? null,
        note: dto.note ?? null,
      },
    });
  }

  /**
   * Get current balance for an employee: SUM of all non-deleted ledger entries.
   * Positive entries = earned, negative = paid out.
   */
  async getBalance(employeeId: string): Promise<LedgerSummary> {
    const result = await this.prisma.$queryRaw<
      [{ total_earned: bigint; total_deducted: bigint }]
    >`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS total_earned,
        COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0) AS total_deducted
      FROM "EmployeeLedgerEntry"
      WHERE "employeeId" = ${employeeId}
        AND "deletedAt" IS NULL
    `;

    const totalEarned = Number(result[0]?.total_earned ?? 0);
    const totalDeducted = Number(result[0]?.total_deducted ?? 0); // negative number
    return {
      totalEarned,
      totalDeducted: Math.abs(totalDeducted),
      currentBalance: totalEarned + totalDeducted, // totalDeducted is already negative
    };
  }

  /**
   * Get paginated ledger statement for an employee, with optional date range filter.
   */
  async getStatement(
    employeeId: string,
    options: {
      from?: string;
      to?: string;
      type?: LedgerEntryType;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { from, to, type, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeLedgerEntryWhereInput = {
      employeeId,
      deletedAt: null,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(type ? { type: type as PrismaLedgerEntryType } : {}),
    };

    const [entries, total, summary] = await Promise.all([
      this.prisma.employeeLedgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          employee: { select: { id: true, fullName: true } },
          branch: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true } },
          orderItemTask: {
            select: {
              id: true,
              stepKey: true,
              stepName: true,
              orderItem: {
                select: {
                  garmentTypeName: true,
                  order: { select: { orderNumber: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.employeeLedgerEntry.count({ where }),
      this.getBalance(employeeId),
    ]);

    return {
      entries,
      summary,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get earnings grouped by week for the last N weeks.
   */
  async getEarningsByPeriod(employeeId: string, weeksBack = 12) {
    const rawData = await this.prisma.$queryRaw<
      {
        period: Date;
        earned: bigint;
        paid: bigint;
        closingBalance: bigint;
      }[]
    >`
      WITH period_data AS (
        SELECT
          date_trunc('week', "createdAt" AT TIME ZONE 'Asia/Karachi') AS period,
          SUM(amount) FILTER (WHERE amount > 0) AS earned,
          ABS(SUM(amount) FILTER (WHERE amount < 0)) AS paid
        FROM "EmployeeLedgerEntry"
        WHERE "employeeId" = ${employeeId}
          AND "deletedAt" IS NULL
          AND "createdAt" >= NOW() - (${weeksBack} || ' weeks')::interval
        GROUP BY period
      )
      SELECT
        period,
        COALESCE(earned, 0) AS earned,
        COALESCE(paid, 0) AS paid,
        COALESCE(earned, 0) - COALESCE(paid, 0) AS "closingBalance"
      FROM period_data
      ORDER BY period DESC
    `;

    return rawData.map((item) => ({
      period: item.period,
      earned: Number(item.earned),
      paid: Number(item.paid),
      closingBalance: Number(item.closingBalance),
    }));
  }

  async remove(id: string, branchId: string) {
    return this.prisma.employeeLedgerEntry.update({
      where: { id, branchId },
      data: { deletedAt: new Date() },
    });
  }
}
