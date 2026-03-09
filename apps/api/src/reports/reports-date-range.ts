import { Prisma } from '@prisma/client';
import { TrendGranularity } from '@tbms/shared-types';

export interface ResolvedDateRange {
  fromDate: Date;
  toDate: Date;
}

type DateRangeColumn =
  | 'orderCreatedAt'
  | 'orderPaymentPaidAt'
  | 'expenseDate'
  | 'orderItemCompletedAt'
  | 'taskCompletedAt';

export function resolveOptionalDateRange(
  from?: string,
  to?: string,
): ResolvedDateRange | null {
  if (!from && !to) {
    return null;
  }

  const now = new Date();

  const fromDate = from ? new Date(from) : new Date(now);
  const toDate = to ? new Date(to) : new Date(now);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return null;
  }

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  if (fromDate.getTime() > toDate.getTime()) {
    const normalizedFromDate = new Date(toDate);
    normalizedFromDate.setHours(0, 0, 0, 0);

    const normalizedToDate = new Date(fromDate);
    normalizedToDate.setHours(23, 59, 59, 999);

    return { fromDate: normalizedFromDate, toDate: normalizedToDate };
  }

  return { fromDate, toDate };
}

export function resolveDateRange(
  from?: string,
  to?: string,
  fallbackDays = 30,
): ResolvedDateRange {
  const explicitRange = resolveOptionalDateRange(from, to);
  if (explicitRange) {
    return explicitRange;
  }

  const toDate = new Date();
  toDate.setHours(23, 59, 59, 999);

  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - (fallbackDays - 1));
  fromDate.setHours(0, 0, 0, 0);

  return { fromDate, toDate };
}

export function resolvePreviousRange(
  currentRange: ResolvedDateRange,
): ResolvedDateRange {
  const spanMs =
    currentRange.toDate.getTime() - currentRange.fromDate.getTime() + 1;
  const previousToDate = new Date(currentRange.fromDate.getTime() - 1);
  const previousFromDate = new Date(previousToDate.getTime() - spanMs + 1);

  previousFromDate.setHours(0, 0, 0, 0);
  previousToDate.setHours(23, 59, 59, 999);

  return { fromDate: previousFromDate, toDate: previousToDate };
}

export function getSqlDateCondition(
  column: DateRangeColumn,
  range: ResolvedDateRange | null,
): Prisma.Sql {
  if (!range) {
    return Prisma.empty;
  }

  switch (column) {
    case 'orderPaymentPaidAt':
      return Prisma.sql`AND op."paidAt" BETWEEN ${range.fromDate} AND ${range.toDate}`;
    case 'expenseDate':
      return Prisma.sql`AND e."expenseDate" BETWEEN ${range.fromDate} AND ${range.toDate}`;
    case 'orderCreatedAt':
      return Prisma.sql`AND o."createdAt" BETWEEN ${range.fromDate} AND ${range.toDate}`;
    case 'orderItemCompletedAt':
      return Prisma.sql`AND oi."completedAt" BETWEEN ${range.fromDate} AND ${range.toDate}`;
    case 'taskCompletedAt':
      return Prisma.sql`AND oit."completedAt" BETWEEN ${range.fromDate} AND ${range.toDate}`;
    default:
      return Prisma.empty;
  }
}

export function toTrendGranularity(value?: string): TrendGranularity {
  if (value === 'day' || value === 'week' || value === 'month') {
    return value;
  }

  return 'week';
}

export function getTrendSql(granularity: TrendGranularity): {
  truncateUnitSql: Prisma.Sql;
  stepSql: Prisma.Sql;
} {
  if (granularity === 'day') {
    return {
      truncateUnitSql: Prisma.sql`'day'`,
      stepSql: Prisma.sql`INTERVAL '1 day'`,
    };
  }

  if (granularity === 'month') {
    return {
      truncateUnitSql: Prisma.sql`'month'`,
      stepSql: Prisma.sql`INTERVAL '1 month'`,
    };
  }

  return {
    truncateUnitSql: Prisma.sql`'week'`,
    stepSql: Prisma.sql`INTERVAL '1 week'`,
  };
}

export function formatTrendLabel(
  date: Date,
  granularity: TrendGranularity,
): string {
  if (granularity === 'day') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  if (granularity === 'month') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
  }

  return `Week of ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`;
}
