import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LedgerEntryType,
  PaymentType,
  Prisma,
} from '@prisma/client';
import type {
  SalaryAccrualGenerationResult,
  SalaryAccrualSource,
  SalaryAccrualSkipReason,
} from '@tbms/shared-types';

const PAYROLL_TIMEZONE = 'Asia/Karachi';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface GenerateSalaryAccrualParams {
  branchId: string;
  month?: string;
  employeeId?: string;
  generatedById?: string | null;
  source: SalaryAccrualSource;
}

interface PayrollPeriod {
  year: number;
  month: number;
  key: string;
  start: Date;
  end: Date;
  daysInMonth: number;
}

interface CompensationWindow {
  employeeId: string;
  paymentType: PaymentType;
  monthlySalary: number | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

@Injectable()
export class SalaryAccrualService {
  constructor(private readonly prisma: PrismaService) {}

  private getMonthPartsInTimezone(referenceDate: Date) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: PAYROLL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
    });

    const parts = formatter.formatToParts(referenceDate);
    const year = Number(parts.find((part) => part.type === 'year')?.value);
    const month = Number(parts.find((part) => part.type === 'month')?.value);

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      throw new BadRequestException('Could not resolve payroll month in configured timezone');
    }

    return { year, month };
  }

  private buildPeriod(year: number, month: number): PayrollPeriod {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthLabel = String(month).padStart(2, '0');

    return {
      year,
      month,
      key: `${year}-${monthLabel}`,
      start: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(year, month - 1, daysInMonth, 23, 59, 59, 999)),
      daysInMonth,
    };
  }

  private resolveTargetPeriod(month?: string): PayrollPeriod {
    if (!month) {
      const { year, month: localMonth } = this.getMonthPartsInTimezone(new Date());
      const previousMonth = localMonth === 1 ? 12 : localMonth - 1;
      const previousYear = localMonth === 1 ? year - 1 : year;
      return this.buildPeriod(previousYear, previousMonth);
    }

    const parsed = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month.trim());
    if (!parsed) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const year = Number(parsed[1]);
    const monthNumber = Number(parsed[2]);
    return this.buildPeriod(year, monthNumber);
  }

  private toUtcDayTimestamp(value: Date): number {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  private getEligibleDaysInPeriod(params: {
    rangeStart: Date;
    rangeEnd: Date;
    period: PayrollPeriod;
  }): number {
    const monthStart = this.toUtcDayTimestamp(params.period.start);
    const monthEnd = this.toUtcDayTimestamp(params.period.end);

    const employmentStart = this.toUtcDayTimestamp(params.rangeStart);
    const employmentEnd = this.toUtcDayTimestamp(params.rangeEnd);

    const effectiveStart = Math.max(monthStart, employmentStart);
    const effectiveEnd = Math.min(monthEnd, employmentEnd);

    if (effectiveEnd < effectiveStart) {
      return 0;
    }

    return Math.floor((effectiveEnd - effectiveStart) / DAY_IN_MS) + 1;
  }

  private buildSalaryNote(period: PayrollPeriod, eligibleDays: number): string {
    if (eligibleDays === period.daysInMonth) {
      return `Monthly salary accrual for ${period.key}`;
    }

    return `Monthly salary accrual for ${period.key} (${eligibleDays}/${period.daysInMonth} days prorated)`;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }

  private pushSkippedItem(
    result: SalaryAccrualGenerationResult,
    employee: { id: string; fullName: string },
    reason: SalaryAccrualSkipReason,
  ) {
    result.skippedItems.push({
      employeeId: employee.id,
      employeeName: employee.fullName,
      reason,
    });
  }

  async generateForMonth(
    params: GenerateSalaryAccrualParams,
  ): Promise<SalaryAccrualGenerationResult> {
    const period = this.resolveTargetPeriod(params.month);

    const employees = await this.prisma.employee.findMany({
      where: {
        branchId: params.branchId,
        deletedAt: null,
        dateOfJoining: { lte: period.end },
        ...(params.employeeId ? { id: params.employeeId } : {}),
      },
      select: {
        id: true,
        fullName: true,
        branchId: true,
        dateOfJoining: true,
        employmentEndDate: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (params.employeeId && employees.length === 0) {
      throw new NotFoundException('Employee not found in selected branch scope');
    }

    const compensationWindows = await this.prisma.employeeCompensationHistory.findMany({
      where: {
        employeeId: { in: employees.map((employee) => employee.id) },
        effectiveFrom: { lte: period.end },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.start } }],
      },
      select: {
        employeeId: true,
        paymentType: true,
        monthlySalary: true,
        effectiveFrom: true,
        effectiveTo: true,
      },
      orderBy: [{ employeeId: 'asc' }, { effectiveFrom: 'asc' }],
    });

    const compensationByEmployee = new Map<string, CompensationWindow[]>();
    for (const window of compensationWindows) {
      const existing = compensationByEmployee.get(window.employeeId);
      if (existing) {
        existing.push(window);
      } else {
        compensationByEmployee.set(window.employeeId, [window]);
      }
    }

    const result: SalaryAccrualGenerationResult = {
      period: period.key,
      processed: 0,
      created: 0,
      alreadyExists: 0,
      skipped: 0,
      skippedItems: [],
    };

    for (const employee of employees) {
      result.processed += 1;

      const employeeCompensationWindows =
        compensationByEmployee.get(employee.id) ?? [];
      const monthlyWindows = employeeCompensationWindows.filter(
        (window) => window.paymentType === PaymentType.MONTHLY_FIXED,
      );

      if (monthlyWindows.length === 0) {
        this.pushSkippedItem(result, employee, 'NO_MONTHLY_COMPENSATION_WINDOW');
        continue;
      }

      let eligibleDays = 0;
      let amount = 0;
      let hasMonthlySalaryValue = false;

      for (const window of monthlyWindows) {
        if (!window.monthlySalary || window.monthlySalary <= 0) {
          continue;
        }

        hasMonthlySalaryValue = true;
        const rangeStartCandidates = [
          period.start,
          employee.dateOfJoining,
          window.effectiveFrom,
        ];
        const rangeEndCandidates = [
          period.end,
          employee.employmentEndDate ?? period.end,
          window.effectiveTo ?? period.end,
        ];

        const rangeStart = new Date(
          Math.max(...rangeStartCandidates.map((candidate) => candidate.getTime())),
        );
        const rangeEnd = new Date(
          Math.min(...rangeEndCandidates.map((candidate) => candidate.getTime())),
        );

        const windowEligibleDays = this.getEligibleDaysInPeriod({
          rangeStart,
          rangeEnd,
          period,
        });

        if (windowEligibleDays <= 0) {
          continue;
        }

        eligibleDays += windowEligibleDays;
        amount += Math.round(
          (window.monthlySalary * windowEligibleDays) / period.daysInMonth,
        );
      }

      if (!hasMonthlySalaryValue) {
        this.pushSkippedItem(result, employee, 'MISSING_MONTHLY_SALARY');
        continue;
      }

      if (eligibleDays <= 0) {
        this.pushSkippedItem(result, employee, 'NO_EMPLOYMENT_OVERLAP');
        continue;
      }

      if (amount <= 0) {
        this.pushSkippedItem(result, employee, 'ZERO_AMOUNT_AFTER_PRORATION');
        continue;
      }

      try {
        const created = await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.salaryAccrual.findUnique({
              where: {
                employeeId_periodYear_periodMonth: {
                  employeeId: employee.id,
                  periodYear: period.year,
                  periodMonth: period.month,
                },
              },
              select: { id: true },
            });

            if (existing) {
              return false;
            }

            const ledgerEntry = await tx.employeeLedgerEntry.create({
              data: {
                employeeId: employee.id,
                branchId: employee.branchId,
                type: LedgerEntryType.SALARY,
                amount,
                createdById: params.generatedById ?? null,
                note: this.buildSalaryNote(period, eligibleDays),
              },
            });

            await tx.salaryAccrual.create({
              data: {
                employeeId: employee.id,
                branchId: employee.branchId,
                periodYear: period.year,
                periodMonth: period.month,
                periodStart: period.start,
                periodEnd: period.end,
                daysInMonth: period.daysInMonth,
                eligibleDays,
                amount,
                ledgerEntryId: ledgerEntry.id,
                generatedById: params.generatedById ?? null,
                source: params.source,
              },
            });

            return true;
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );

        if (created) {
          result.created += 1;
        } else {
          result.alreadyExists += 1;
        }
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          result.alreadyExists += 1;
          continue;
        }

        throw error;
      }
    }

    result.skipped = result.skippedItems.length;
    return result;
  }
}
