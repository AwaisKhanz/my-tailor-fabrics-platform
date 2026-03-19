import { Injectable } from '@nestjs/common';
import {
  AddonAnalytics,
  DesignAnalytics,
  DistributionPoint,
  EmployeeStatus,
  ItemStatus,
  EmployeeProductivity,
  OrderStatus,
  FinancialTrend,
  GarmentRevenue,
  ProductivityPoint,
  ReportDistributions,
  RevenueVsExpenses,
  TaskStatus,
} from '@tbms/shared-types';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatTrendLabel,
  getSqlDateCondition,
  getTrendSql,
  type ResolvedDateRange,
  resolveDateRange,
  resolveOptionalDateRange,
  resolvePreviousRange,
  toTrendGranularity,
} from './reports-date-range';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private toDistributionPoints(
    rows: Array<{ key: string; label: string; value: number }>,
  ): DistributionPoint[] {
    const total = rows.reduce((sum, row) => sum + row.value, 0);

    return rows.map((row) => ({
      ...row,
      share: total > 0 ? Number(((row.value / total) * 100).toFixed(2)) : 0,
    }));
  }

  private async getFinancialTotals(
    branchId?: string,
    range: ResolvedDateRange | null = null,
  ): Promise<{ revenue: number; expenses: number }> {
    const orderWhere: Prisma.OrderPaymentWhereInput = {
      deletedAt: null,
      reversedAt: null,
      order: {
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      ...(range
        ? {
            paidAt: {
              gte: range.fromDate,
              lte: range.toDate,
            },
          }
        : {}),
    };

    const expenseWhere: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(range
        ? {
            expenseDate: {
              gte: range.fromDate,
              lte: range.toDate,
            },
          }
        : {}),
    };

    const [revenueResult, expensesResult] = await Promise.all([
      this.prisma.orderPayment.aggregate({
        _sum: { amount: true },
        where: orderWhere,
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: expenseWhere,
      }),
    ]);

    return {
      revenue: revenueResult._sum.amount ?? 0,
      expenses: expensesResult._sum.amount ?? 0,
    };
  }

  async getDashboardStats(branchId?: string, from?: string, to?: string) {
    const range = resolveOptionalDateRange(from, to);

    const baseOrderWhere: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(range
        ? {
            createdAt: {
              gte: range.fromDate,
              lte: range.toDate,
            },
          }
        : {}),
    };

    const { revenue, expenses } = await this.getFinancialTotals(
      branchId,
      range,
    );

    // Outstanding receivables are operationally current and intentionally not date-windowed.
    const receivablesResult = await this.prisma.order.aggregate({
      _sum: { balanceDue: true },
      where: {
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
    });

    const outstandingBalances = receivablesResult._sum.balanceDue ?? 0;

    const overdueCount = await this.prisma.order.count({
      where: {
        ...baseOrderWhere,
        status: OrderStatus.OVERDUE,
      },
    });

    const totalOrders = await this.prisma.order.count({
      where: baseOrderWhere,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newToday = await this.prisma.order.count({
      where: {
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
        createdAt: { gte: today },
      },
    });

    const [totalCustomers, activeEmployees, recentOrders] = await Promise.all([
      this.prisma.customer.count({
        where: branchId ? { branchId, deletedAt: null } : { deletedAt: null },
      }),
      this.prisma.employee.count({
        where: branchId
          ? { branchId, status: EmployeeStatus.ACTIVE, deletedAt: null }
          : { status: EmployeeStatus.ACTIVE, deletedAt: null },
      }),
      this.prisma.order.findMany({
        where: baseOrderWhere,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: true,
          items: true,
        },
      }),
    ]);

    return {
      revenue,
      expenses,
      outstandingBalances,
      overdueOrders: overdueCount,
      overdueCount,
      totalOrders,
      newToday,
      totalOutstandingBalance: outstandingBalances,
      totalCustomers,
      activeEmployees,
      recentOrders,
    };
  }

  async getRevenueVsExpenses(
    branchId?: string,
    months: number = 6,
  ): Promise<RevenueVsExpenses> {
    const safeMonths = Number.isFinite(months) && months > 0 ? months : 6;
    const branchConditionOrder = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;
    const branchConditionExpense = branchId
      ? Prisma.sql`AND e."branchId" = ${branchId}`
      : Prisma.empty;

    const revenueRaw = await this.prisma.$queryRaw<
      { month: Date; total: bigint }[]
    >(
      Prisma.sql`
        SELECT date_trunc('month', op."paidAt") as month, SUM(op.amount) as total
        FROM "OrderPayment" op
        JOIN "Order" o ON o.id = op."orderId"
        WHERE op."paidAt" >= NOW() - (${safeMonths} * INTERVAL '1 month')
          AND op."deletedAt" IS NULL
          AND op."reversedAt" IS NULL
          AND o."deletedAt" IS NULL
          ${branchConditionOrder}
        GROUP BY month
        ORDER BY month ASC
      `,
    );

    const expenseRaw = await this.prisma.$queryRaw<
      { month: Date; total: bigint }[]
    >(
      Prisma.sql`
        SELECT date_trunc('month', e."expenseDate") as month, SUM(e.amount) as total
        FROM "Expense" e
        WHERE e."expenseDate" >= NOW() - (${safeMonths} * INTERVAL '1 month')
          AND e."deletedAt" IS NULL
          ${branchConditionExpense}
        GROUP BY month
        ORDER BY month ASC
      `,
    );

    return {
      revenue: revenueRaw.map((r) => ({
        month: r.month,
        total: Number(r.total),
      })),
      expenses: expenseRaw.map((e) => ({
        month: e.month,
        total: Number(e.total),
      })),
    };
  }

  async getFinancialTrend(
    branchId?: string,
    from?: string,
    to?: string,
    granularity?: string,
  ): Promise<FinancialTrend> {
    const range = resolveDateRange(from, to, 30);
    const resolvedGranularity = toTrendGranularity(granularity);
    const { truncateUnitSql, stepSql } = getTrendSql(resolvedGranularity);

    const branchConditionOrder = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;
    const branchConditionExpense = branchId
      ? Prisma.sql`AND e."branchId" = ${branchId}`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<
      { periodStart: Date; revenue: number; expenses: number; net: number }[]
    >(
      Prisma.sql`
        WITH period_series AS (
          SELECT generate_series(
            date_trunc(${truncateUnitSql}, ${range.fromDate}),
            date_trunc(${truncateUnitSql}, ${range.toDate}),
            ${stepSql}
          ) AS "periodStart"
        ),
        revenue_series AS (
          SELECT
            date_trunc(${truncateUnitSql}, op."paidAt") AS "periodStart",
            COALESCE(SUM(op.amount), 0)::double precision AS revenue
          FROM "OrderPayment" op
          JOIN "Order" o ON o.id = op."orderId"
          WHERE o."deletedAt" IS NULL
            AND op."deletedAt" IS NULL
            AND op."reversedAt" IS NULL
            ${getSqlDateCondition('orderPaymentPaidAt', range)}
            ${branchConditionOrder}
          GROUP BY 1
        ),
        expense_series AS (
          SELECT
            date_trunc(${truncateUnitSql}, e."expenseDate") AS "periodStart",
            COALESCE(SUM(e.amount), 0)::double precision AS expenses
          FROM "Expense" e
          WHERE e."deletedAt" IS NULL
            ${getSqlDateCondition('expenseDate', range)}
            ${branchConditionExpense}
          GROUP BY 1
        )
        SELECT
          s."periodStart",
          COALESCE(r.revenue, 0)::double precision AS revenue,
          COALESCE(ex.expenses, 0)::double precision AS expenses,
          (COALESCE(r.revenue, 0) - COALESCE(ex.expenses, 0))::double precision AS net
        FROM period_series s
        LEFT JOIN revenue_series r ON r."periodStart" = s."periodStart"
        LEFT JOIN expense_series ex ON ex."periodStart" = s."periodStart"
        ORDER BY s."periodStart" ASC
      `,
    );

    const points = rows.map((row) => ({
      periodStart: row.periodStart.toISOString(),
      label: formatTrendLabel(new Date(row.periodStart), resolvedGranularity),
      revenue: Number(row.revenue ?? 0),
      expenses: Number(row.expenses ?? 0),
      net: Number(row.net ?? 0),
    }));

    const totals = points.reduce(
      (accumulator, point) => ({
        revenue: accumulator.revenue + point.revenue,
        expenses: accumulator.expenses + point.expenses,
        net: accumulator.net + point.net,
      }),
      { revenue: 0, expenses: 0, net: 0 },
    );

    return {
      granularity: resolvedGranularity,
      points,
      totals,
    };
  }

  async getGarmentTypesRevenue(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<GarmentRevenue[]> {
    const branchCondition = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;
    const range = resolveOptionalDateRange(from, to);

    const result = await this.prisma.$queryRaw<
      { label: string; value: bigint }[]
    >(
      Prisma.sql`
        SELECT oi."garmentTypeName" as label, SUM(oi."unitPrice" * oi.quantity) as value
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
          AND o."deletedAt" IS NULL
          ${branchCondition}
          ${getSqlDateCondition('orderCreatedAt', range)}
        GROUP BY oi."garmentTypeName"
        ORDER BY value DESC
      `,
    );

    return result.map((r) => ({ label: r.label, value: Number(r.value) }));
  }

  async getDistributions(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<ReportDistributions> {
    const range = resolveDateRange(from, to, 30);
    const branchCondition = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;

    const [designRows, addonRows, garmentRows] = await Promise.all([
      this.prisma.$queryRaw<{ key: string; label: string; value: number }[]>(
        Prisma.sql`
          SELECT
            COALESCE(dt.id::text, dt.name) AS key,
            COALESCE(dt.name, 'Unassigned') AS label,
            COALESCE(SUM(oi."unitPrice" * oi.quantity), 0)::double precision AS value
          FROM "OrderItem" oi
          JOIN "Order" o ON o.id = oi."orderId"
          LEFT JOIN "DesignType" dt ON dt.id = oi."designTypeId"
          WHERE o."deletedAt" IS NULL
            AND oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
            AND oi."designTypeId" IS NOT NULL
            ${branchCondition}
            ${getSqlDateCondition('orderCreatedAt', range)}
          GROUP BY dt.id, dt.name
          ORDER BY value DESC
        `,
      ),
      this.prisma.$queryRaw<{ key: string; label: string; value: number }[]>(
        Prisma.sql`
          SELECT
            LOWER(REPLACE(a.type::text, '_', '-')) AS key,
            INITCAP(REPLACE(a.type::text, '_', ' ')) AS label,
            COALESCE(SUM(a.price), 0)::double precision AS value
          FROM "OrderItemAddon" a
          JOIN "OrderItem" oi ON oi.id = a."orderItemId"
          JOIN "Order" o ON o.id = oi."orderId"
          WHERE o."deletedAt" IS NULL
            AND a."deletedAt" IS NULL
            AND oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
            ${branchCondition}
            ${getSqlDateCondition('orderCreatedAt', range)}
          GROUP BY a.type
          ORDER BY value DESC
        `,
      ),
      this.prisma.$queryRaw<{ key: string; label: string; value: number }[]>(
        Prisma.sql`
          SELECT
            LOWER(REPLACE(oi."garmentTypeName", ' ', '-')) AS key,
            oi."garmentTypeName" AS label,
            COALESCE(SUM(oi."unitPrice" * oi.quantity), 0)::double precision AS value
          FROM "OrderItem" oi
          JOIN "Order" o ON o.id = oi."orderId"
          WHERE o."deletedAt" IS NULL
            AND oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
            ${branchCondition}
            ${getSqlDateCondition('orderCreatedAt', range)}
          GROUP BY oi."garmentTypeName"
          ORDER BY value DESC
        `,
      ),
    ]);

    return {
      designs: this.toDistributionPoints(designRows),
      addons: this.toDistributionPoints(addonRows),
      garments: this.toDistributionPoints(garmentRows),
    };
  }

  async getProductivityPoints(
    branchId?: string,
    from?: string,
    to?: string,
    limit?: number,
  ): Promise<ProductivityPoint[]> {
    const range = resolveOptionalDateRange(from, to);
    const safeLimit =
      typeof limit === 'number' && Number.isFinite(limit) && limit > 0
        ? Math.min(limit, 50)
        : 10;

    const branchCondition = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;

    const taskDateCondition = range
      ? getSqlDateCondition('taskCompletedAt', range)
      : Prisma.empty;

    const result = await this.prisma.$queryRaw<
      {
        employeeId: string;
        employeeName: string;
        completedItems: number;
        completedTasks: number;
        payout: number;
      }[]
    >(
      Prisma.sql`
        WITH task_prod AS (
          SELECT
            emp.id::text AS "employeeId",
            emp."fullName" AS "employeeName",
            0::double precision AS "completedItems",
            COUNT(oit.id)::double precision AS "completedTasks",
            COALESCE(SUM(COALESCE(oit."rateOverride", oit."designRateSnapshot", oit."rateSnapshot", 0)), 0)::double precision AS payout
          FROM "OrderItemTask" oit
          JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
          JOIN "Order" o ON o.id = oi."orderId"
          JOIN "Employee" emp ON emp.id = oit."assignedEmployeeId"
          WHERE oit.status = CAST(${TaskStatus.DONE} AS "TaskStatus")
            AND o."deletedAt" IS NULL
            AND emp."deletedAt" IS NULL
            ${branchCondition}
            ${taskDateCondition}
          GROUP BY emp.id, emp."fullName"
        )
        SELECT
          "employeeId",
          "employeeName",
          0::double precision AS "completedItems",
          COALESCE("completedTasks", 0)::double precision AS "completedTasks",
          COALESCE(payout, 0)::double precision AS payout
        FROM task_prod
        ORDER BY "completedTasks" DESC
        LIMIT ${safeLimit}
      `,
    );

    return result.map((row) => {
      const completedItems = Number(row.completedItems ?? 0);
      const completedTasks = Number(row.completedTasks ?? 0);

      return {
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        completedItems,
        completedTasks,
        totalCompleted: completedItems + completedTasks,
        payout: Number(row.payout ?? 0),
      };
    });
  }

  async getEmployeeProductivity(
    branchId?: string,
    from?: string,
    to?: string,
    limit?: number,
  ): Promise<EmployeeProductivity[]> {
    const rows = await this.getProductivityPoints(branchId, from, to, limit);

    return rows.map((row) => ({
      label: row.employeeName,
      value: row.totalCompleted,
    }));
  }

  async getDesignAnalytics(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<DesignAnalytics[]> {
    const branchCondition = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;

    const range = resolveOptionalDateRange(from, to);

    const result = await this.prisma.$queryRaw<
      { name: string; count: bigint; revenue: bigint; payout: bigint }[]
    >(
      Prisma.sql`
        SELECT
          dt.name,
          COUNT(oi.id) as count,
          COALESCE(SUM(oi."unitPrice" * oi.quantity), 0) as revenue,
          COALESCE(SUM(COALESCE(task_payout.payout, 0)), 0) as payout
        FROM "OrderItem" oi
        JOIN "DesignType" dt ON dt.id = oi."designTypeId"
        JOIN "Order" o ON o.id = oi."orderId"
        LEFT JOIN LATERAL (
          SELECT
            COALESCE(SUM(COALESCE(oit."rateOverride", oit."designRateSnapshot", oit."rateSnapshot", 0)), 0) AS payout
          FROM "OrderItemTask" oit
          WHERE oit."orderItemId" = oi.id
            AND oit."deletedAt" IS NULL
            AND oit."designTypeId" = oi."designTypeId"
        ) AS task_payout ON TRUE
        WHERE o."deletedAt" IS NULL
          AND oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
          ${branchCondition}
          ${getSqlDateCondition('orderCreatedAt', range)}
        GROUP BY dt.id, dt.name
        ORDER BY count DESC
      `,
    );

    return result.map((r) => ({
      name: r.name,
      count: Number(r.count),
      revenue: Number(r.revenue),
      payout: Number(r.payout),
    }));
  }

  async getAddonAnalytics(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<AddonAnalytics[]> {
    const branchCondition = branchId
      ? Prisma.sql`AND o."branchId" = ${branchId}`
      : Prisma.empty;

    const range = resolveOptionalDateRange(from, to);

    const result = await this.prisma.$queryRaw<
      { type: string; count: bigint; total: bigint }[]
    >(
      Prisma.sql`
        SELECT
          a.type,
          COUNT(a.id) as count,
          SUM(a.price) as total
        FROM "OrderItemAddon" a
        JOIN "OrderItem" oi ON oi.id = a."orderItemId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE o."deletedAt" IS NULL
          AND a."deletedAt" IS NULL
          AND oi.status <> CAST(${ItemStatus.CANCELLED} AS "ItemStatus")
          ${branchCondition}
          ${getSqlDateCondition('orderCreatedAt', range)}
        GROUP BY a.type
        ORDER BY total DESC
      `,
    );

    return result.map((r) => ({
      type: r.type,
      count: Number(r.count),
      total: Number(r.total),
    }));
  }

  async getSummary(branchId?: string, from?: string, to?: string) {
    const currentRange = resolveDateRange(from, to, 30);
    const previousRange = resolvePreviousRange(currentRange);

    const [designs, addons, dashboard, previousTotals] = await Promise.all([
      this.getDesignAnalytics(branchId, from, to),
      this.getAddonAnalytics(branchId, from, to),
      this.getDashboardStats(
        branchId,
        currentRange.fromDate.toISOString(),
        currentRange.toDate.toISOString(),
      ),
      this.getFinancialTotals(branchId, {
        fromDate: previousRange.fromDate,
        toDate: previousRange.toDate,
      }),
    ]);

    const totalDesignRevenue = designs.reduce(
      (sum, design) => sum + design.revenue,
      0,
    );
    const totalAddonRevenue = addons.reduce(
      (sum, addon) => sum + addon.total,
      0,
    );
    const net = dashboard.revenue - dashboard.expenses;
    const revenueDelta = dashboard.revenue - previousTotals.revenue;
    const expensesDelta = dashboard.expenses - previousTotals.expenses;
    const netDelta = net - (previousTotals.revenue - previousTotals.expenses);

    return {
      ...dashboard,
      totalDesignRevenue,
      totalAddonRevenue,
      net,
      previousPeriodRevenue: previousTotals.revenue,
      previousPeriodExpenses: previousTotals.expenses,
      previousPeriodNet: previousTotals.revenue - previousTotals.expenses,
      revenueDelta,
      expensesDelta,
      netDelta,
      designs,
      addons,
    };
  }
}
