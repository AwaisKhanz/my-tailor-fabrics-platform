import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerEntryType, WeeklyPaymentReportRow } from '@tbms/shared-types';
import { requireEmployeeInScope } from '../common/utils/employee-scope.util';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const MAX_TRANSACTION_RETRIES = 3;
const DEFAULT_HISTORY_PAGE = 1;
const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 100;

const PAYMENT_HISTORY_SORT_FIELDS: ReadonlyArray<
  keyof Prisma.PaymentOrderByWithRelationInput
> = ['paidAt', 'createdAt', 'amount'];
type PaymentSortField = (typeof PAYMENT_HISTORY_SORT_FIELDS)[number];

function isPaymentSortField(value?: string): value is PaymentSortField {
  if (!value) {
    return false;
  }

  return PAYMENT_HISTORY_SORT_FIELDS.some((field) => field === value);
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  private async assertEmployeeScope(
    employeeId: string,
    actorBranchId?: string | null,
  ) {
    return requireEmployeeInScope(this.prisma, {
      employeeId,
      branchId: actorBranchId,
    });
  }

  async getEmployeeBalanceSummary(
    employeeId: string,
    actorBranchId?: string | null,
  ) {
    await this.assertEmployeeScope(employeeId, actorBranchId);

    // Use ledger as single source of truth for balance
    const balance = await this.ledgerService.getBalance(
      employeeId,
      actorBranchId,
    );
    const weekly = await this.getWeeklyBreakdown(employeeId, 8, actorBranchId);
    return {
      totalEarned: balance.totalEarned,
      totalPaid: balance.totalDeducted,
      currentBalance: balance.currentBalance,
      weekly,
    };
  }

  async getWeeklyBreakdown(
    employeeId: string,
    weeksBack = 8,
    actorBranchId?: string | null,
  ) {
    const earnings = await this.ledgerService.getEarningsByPeriod(
      employeeId,
      weeksBack,
      actorBranchId,
    );
    // Map Ledger earnings to the format expected by the legacy weekly breakdown if needed,
    // or just return the ledger results.
    return earnings.map((item) => ({
      week_start: item.period,
      earned: item.earned,
      paid: item.paid,
      closing_balance: item.closingBalance,
    }));
  }

  async disbursePay(
    employeeId: string,
    amount: number,
    processedById: string,
    actorBranchId?: string | null,
    note?: string,
  ) {
    const employee = await this.assertEmployeeScope(employeeId, actorBranchId);

    for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const aggregate = await tx.employeeLedgerEntry.aggregate({
              where: { employeeId, deletedAt: null },
              _sum: { amount: true },
            });

            const currentBalance = aggregate._sum.amount ?? 0;
            if (amount > currentBalance) {
              throw new UnprocessableEntityException({
                code: 'PAYMENT_EXCEEDS_BALANCE',
                message: `Cannot disburse ${amount / 100}. Balance is ${currentBalance / 100}`,
              });
            }

            const payment = await tx.payment.create({
              data: { employeeId, amount, processedById, note },
            });

            // Keep payment + payout-ledger mutation atomic.
            await this.ledgerService.createEntry(
              {
                employeeId,
                branchId: employee.branchId,
                type: LedgerEntryType.PAYOUT,
                amount: -amount,
                paymentId: payment.id,
                createdById: processedById,
                note: note || 'Salary payment',
              },
              tx,
            );

            return payment;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          this.isSerializationConflict(error) &&
          attempt < MAX_TRANSACTION_RETRIES
        ) {
          continue;
        }
        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Concurrent payroll update detected. Please retry.',
          );
        }
        throw error;
      }
    }

    throw new ConflictException('Unable to process payment at this time');
  }

  private parseDateBoundary(
    value?: string,
    endOfDay = false,
  ): Date | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date.setUTCHours(23, 59, 59, 999);
    }

    return date;
  }

  private isSerializationConflict(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    );
  }

  private resolveOrderBy(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Prisma.PaymentOrderByWithRelationInput {
    const field: PaymentSortField = isPaymentSortField(sortBy)
      ? sortBy
      : 'paidAt';
    const direction: Prisma.SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    return { [field]: direction };
  }

  async getHistory(
    employeeId: string,
    page = 1,
    limit = 20,
    from?: string,
    to?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    actorBranchId?: string | null,
  ) {
    await this.assertEmployeeScope(employeeId, actorBranchId);

    const pagination = normalizePagination({
      page,
      limit,
      defaultPage: DEFAULT_HISTORY_PAGE,
      defaultLimit: DEFAULT_HISTORY_LIMIT,
      maxLimit: MAX_HISTORY_LIMIT,
    });

    const fromDate = this.parseDateBoundary(from);
    const toDate = this.parseDateBoundary(to, true);
    const orderBy = this.resolveOrderBy(sortBy, sortOrder);

    const where: Prisma.PaymentWhereInput = {
      employeeId,
      deletedAt: null,
      ...(actorBranchId
        ? {
            ledgerEntries: {
              some: {
                branchId: actorBranchId,
                deletedAt: null,
                type: LedgerEntryType.PAYOUT,
              },
            },
          }
        : {}),
      ...(fromDate || toDate
        ? {
            paidAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getWeeklyReport(
    actorBranchId?: string | null,
  ): Promise<WeeklyPaymentReportRow[]> {
    const ledgerBranchFilter = actorBranchId
      ? Prisma.sql`AND le."branchId" = ${actorBranchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      {
        employeeId: string;
        employeeName: string;
        employeeCode: string;
        paidThisWeek: bigint | number | null;
      }[]
    >`
            WITH scoped_payments AS (
              SELECT DISTINCT
                  p.id,
                  p."employeeId",
                  p.amount
              FROM "Payment" p
              JOIN "EmployeeLedgerEntry" le ON le."paymentId" = p.id
              WHERE p."paidAt" >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Karachi')
                AND p."deletedAt" IS NULL
                AND le."deletedAt" IS NULL
                AND le.type = 'PAYOUT'
                ${ledgerBranchFilter}
            )
            SELECT
                e.id as "employeeId",
                e."fullName" as "employeeName",
                e."employeeCode" as "employeeCode",
                COALESCE(SUM(sp.amount), 0) as "paidThisWeek"
            FROM scoped_payments sp
            JOIN "Employee" e ON e.id = sp."employeeId"
            WHERE e."deletedAt" IS NULL
            GROUP BY e.id, e."fullName", e."employeeCode"
            ORDER BY "paidThisWeek" DESC
        `;

    return rows.map((row) => ({
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      employeeCode: row.employeeCode,
      paidThisWeek: Number(row.paidThisWeek ?? 0),
    }));
  }
}
