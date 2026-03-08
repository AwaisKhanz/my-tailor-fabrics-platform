import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerEntryType } from '@tbms/shared-types';
import type {
  CreateLedgerEntryInput,
  LedgerStatementParams,
  LedgerSummary,
} from '@tbms/shared-types';
import {
  Prisma,
  LedgerEntryType as PrismaLedgerEntryType,
} from '@prisma/client';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';
import { requireEmployeeInScope } from '../common/utils/employee-scope.util';

const LEDGER_ENTRY_TYPE_TO_PRISMA: Record<
  LedgerEntryType,
  PrismaLedgerEntryType
> = {
  [LedgerEntryType.EARNING]: PrismaLedgerEntryType.EARNING,
  [LedgerEntryType.PAYOUT]: PrismaLedgerEntryType.PAYOUT,
  [LedgerEntryType.ADVANCE]: PrismaLedgerEntryType.ADVANCE,
  [LedgerEntryType.DEDUCTION]: PrismaLedgerEntryType.DEDUCTION,
  [LedgerEntryType.ADJUSTMENT]: PrismaLedgerEntryType.ADJUSTMENT,
  [LedgerEntryType.SALARY]: PrismaLedgerEntryType.SALARY,
};

const LEDGER_ENTRY_TYPE_VALUES = new Set<string>(
  Object.values(LedgerEntryType),
);

function isLedgerEntryType(value: string): value is LedgerEntryType {
  return LEDGER_ENTRY_TYPE_VALUES.has(value);
}

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  private parseLedgerEntryType(rawType?: string): LedgerEntryType | undefined {
    if (!rawType) {
      return undefined;
    }
    return isLedgerEntryType(rawType) ? rawType : undefined;
  }

  private toPrismaLedgerEntryType(
    type: LedgerEntryType,
  ): PrismaLedgerEntryType {
    return LEDGER_ENTRY_TYPE_TO_PRISMA[type];
  }

  private async assertEmployeeScope(
    employeeId: string,
    branchId?: string | null,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    await requireEmployeeInScope(client, { employeeId, branchId });
  }

  private async queryBalanceSummary(
    employeeId: string,
    client: PrismaService | Prisma.TransactionClient,
    branchId?: string | null,
  ): Promise<LedgerSummary> {
    const branchCondition = branchId
      ? Prisma.sql`AND "branchId" = ${branchId}`
      : Prisma.empty;

    const result = await client.$queryRaw<
      [{ total_earned: bigint; total_deducted: bigint }]
    >`
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS total_earned,
        COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0) AS total_deducted
      FROM "EmployeeLedgerEntry"
      WHERE "employeeId" = ${employeeId}
        AND "deletedAt" IS NULL
        ${branchCondition}
    `;

    const totalEarned = Number(result[0]?.total_earned ?? 0);
    const totalDeducted = Number(result[0]?.total_deducted ?? 0);

    return {
      totalEarned,
      totalDeducted: Math.abs(totalDeducted),
      currentBalance: totalEarned + totalDeducted,
    };
  }

  /**
   * Create a single ledger entry.
   * Positive amount = EARNING / SALARY / ADJUSTMENT.
   * Negative amount = PAYOUT / ADVANCE / DEDUCTION.
   */
  async createEntry(
    dto: CreateLedgerEntryInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    await this.assertEmployeeScope(dto.employeeId, dto.branchId, tx);

    return client.employeeLedgerEntry.create({
      data: {
        employeeId: dto.employeeId,
        branchId: dto.branchId,
        type: this.toPrismaLedgerEntryType(dto.type),
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
  async getBalance(
    employeeId: string,
    branchId?: string | null,
    tx?: Prisma.TransactionClient,
  ): Promise<LedgerSummary> {
    const client = tx ?? this.prisma;
    await this.assertEmployeeScope(employeeId, branchId, tx);
    return this.queryBalanceSummary(employeeId, client, branchId);
  }

  /**
   * Get paginated ledger statement for an employee, with optional date range filter.
   */
  async getStatement(
    employeeId: string,
    options: LedgerStatementParams = {},
    branchId?: string | null,
  ) {
    await this.assertEmployeeScope(employeeId, branchId);

    const { from, to } = options;
    const type = this.parseLedgerEntryType(options.type);
    const pagination = normalizePagination({
      page: options.page,
      limit: options.limit,
      defaultLimit: 20,
    });

    const where: Prisma.EmployeeLedgerEntryWhereInput = {
      employeeId,
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(type ? { type: this.toPrismaLedgerEntryType(type) } : {}),
    };

    const [entries, total, summary] = await Promise.all([
      this.prisma.employeeLedgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
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
      this.getBalance(employeeId, branchId),
    ]);

    const statement = toPaginatedResponse(entries, total, pagination);
    return {
      entries: statement.data,
      summary,
      meta: {
        total: statement.total,
        page: statement.meta.page,
        lastPage: statement.meta.lastPage,
      },
    };
  }

  /**
   * Get earnings grouped by week for the last N weeks.
   */
  async getEarningsByPeriod(
    employeeId: string,
    weeksBack = 12,
    branchId?: string | null,
  ) {
    await this.assertEmployeeScope(employeeId, branchId);
    const branchCondition = branchId
      ? Prisma.sql`AND "branchId" = ${branchId}`
      : Prisma.empty;

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
          ${branchCondition}
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

  remove(id: string, branchId?: string | null) {
    void id;
    void branchId;
    throw new BadRequestException(
      'Ledger delete is disabled. Use reversal instead.',
    );
  }

  async reverseEntry(
    id: string,
    reversedById: string,
    branchId?: string | null,
    note?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.employeeLedgerEntry.findFirst({
        where: {
          id,
          deletedAt: null,
          reversedAt: null,
          ...(branchId ? { branchId } : {}),
        },
        include: {
          salaryAccrual: { select: { id: true } },
        },
      });

      if (!entry) {
        throw new NotFoundException(
          'Ledger entry not found or already reversed',
        );
      }

      const isSystemGenerated =
        Boolean(entry.paymentId) ||
        Boolean(entry.orderItemTaskId) ||
        Boolean(entry.salaryAccrual) ||
        Boolean(entry.reversalOfId) ||
        entry.type === PrismaLedgerEntryType.SALARY;

      if (isSystemGenerated) {
        throw new BadRequestException(
          'Only manual ledger entries can be reversed.',
        );
      }

      const now = new Date();
      const reversalEntry = await tx.employeeLedgerEntry.create({
        data: {
          employeeId: entry.employeeId,
          branchId: entry.branchId,
          type: LedgerEntryType.ADJUSTMENT,
          amount: -entry.amount,
          createdById: reversedById,
          note: note?.trim() || `Reversal for ledger entry ${entry.id}`,
          reversalOfId: entry.id,
        },
      });

      await tx.employeeLedgerEntry.update({
        where: { id: entry.id },
        data: {
          reversedAt: now,
          reversedById,
          reversalNote: note?.trim() || null,
        },
      });

      return {
        originalEntryId: entry.id,
        reversalEntryId: reversalEntry.id,
        reversedAt: now.toISOString(),
        amount: entry.amount,
      };
    });
  }
}
