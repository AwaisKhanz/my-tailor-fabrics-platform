"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const shared_types_1 = require("@tbms/shared-types");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(branchId) {
        const baseOrderWhere = branchId
            ? { branchId, deletedAt: null }
            : { deletedAt: null };
        const baseExpenseWhere = branchId
            ? { branchId, deletedAt: null }
            : { deletedAt: null };
        const revenue = await this.prisma.orderPayment.aggregate({
            _sum: { amount: true },
            where: { order: baseOrderWhere },
        });
        const expenses = await this.prisma.expense.aggregate({
            _sum: { amount: true },
            where: baseExpenseWhere,
        });
        const earnedBranchCondition = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const totalEarnedQuery = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT (
          (
            SELECT COALESCE(SUM(oi."employeeRate" * oi.quantity), 0)
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            WHERE oi.status IN ('COMPLETED')
              AND o."deletedAt" IS NULL
              ${earnedBranchCondition}
          )
          +
          (
            SELECT COALESCE(SUM(COALESCE(oit."rateOverride", dt."defaultRate", oit."rateSnapshot", 0)), 0)
            FROM "OrderItemTask" oit
            JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
            JOIN "Order" o ON o.id = oi."orderId"
            LEFT JOIN "DesignType" dt ON dt.id = oit."designTypeId"
            WHERE oit.status = 'DONE'
              AND o."deletedAt" IS NULL
              ${earnedBranchCondition}
          )
        ) AS total
      `);
        const employeeCondition = branchId
            ? { employee: { branchId, deletedAt: null } }
            : { employee: { deletedAt: null } };
        const totalPaid = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: employeeCondition,
        });
        const totalEarned = Number(totalEarnedQuery[0]?.total ?? 0);
        const paidOut = totalPaid._sum.amount ?? 0;
        const outstandingBalances = totalEarned - paidOut;
        const overdueCount = await this.prisma.order.count({
            where: {
                ...baseOrderWhere,
                status: shared_types_1.OrderStatus.OVERDUE,
            },
        });
        const totalOrders = await this.prisma.order.count({
            where: baseOrderWhere,
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newToday = await this.prisma.order.count({
            where: {
                ...baseOrderWhere,
                createdAt: { gte: today },
            },
        });
        const totalCustomers = await this.prisma.customer.count({
            where: branchId ? { branchId, deletedAt: null } : { deletedAt: null },
        });
        const activeEmployees = await this.prisma.employee.count({
            where: branchId
                ? { branchId, status: 'ACTIVE', deletedAt: null }
                : { status: 'ACTIVE', deletedAt: null },
        });
        const recentOrders = await this.prisma.order.findMany({
            where: {
                ...baseOrderWhere,
                status: shared_types_1.OrderStatus.OVERDUE,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                customer: true,
                items: true,
            },
        });
        return {
            revenue: revenue._sum.amount ?? 0,
            expenses: expenses._sum.amount ?? 0,
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
    async getRevenueVsExpenses(branchId, months = 6) {
        const safeMonths = Number.isFinite(months) && months > 0 ? months : 6;
        const branchConditionOrder = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const branchConditionExpense = branchId
            ? client_1.Prisma.sql `AND e."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const revenueRaw = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT date_trunc('month', op."paidAt") as month, SUM(op.amount) as total
        FROM "OrderPayment" op
        JOIN "Order" o ON o.id = op."orderId"
        WHERE op."paidAt" >= NOW() - (${safeMonths} * INTERVAL '1 month')
          AND o."deletedAt" IS NULL
          ${branchConditionOrder}
        GROUP BY month
        ORDER BY month ASC
      `);
        const expenseRaw = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT date_trunc('month', e."expenseDate") as month, SUM(e.amount) as total
        FROM "Expense" e
        WHERE e."expenseDate" >= NOW() - (${safeMonths} * INTERVAL '1 month')
          AND e."deletedAt" IS NULL
          ${branchConditionExpense}
        GROUP BY month
        ORDER BY month ASC
      `);
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
    async getGarmentTypesRevenue(branchId) {
        const branchCondition = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const result = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT oi."garmentTypeName" as label, SUM(oi."unitPrice" * oi.quantity) as value
        FROM "OrderItem" oi
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE oi.status NOT IN ('CANCELLED')
          AND o."deletedAt" IS NULL
          ${branchCondition}
        GROUP BY oi."garmentTypeName"
        ORDER BY value DESC
      `);
        return result.map((r) => ({ label: r.label, value: Number(r.value) }));
    }
    async getEmployeeProductivity(branchId) {
        const branchCondition = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const result = await this.prisma.$queryRaw(client_1.Prisma.sql `
        WITH item_prod AS (
          SELECT emp.id, emp."fullName" as label, SUM(oi.quantity) as value
          FROM "OrderItem" oi
          JOIN "Order" o ON o.id = oi."orderId"
          JOIN "Employee" emp ON emp.id = oi."employeeId"
          WHERE oi.status IN ('COMPLETED')
            AND o."deletedAt" IS NULL
            AND emp."deletedAt" IS NULL
            ${branchCondition}
          GROUP BY emp.id, emp."fullName"
        ),
        task_prod AS (
          SELECT emp.id, emp."fullName" as label, COUNT(oit.id) as value
          FROM "OrderItemTask" oit
          JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
          JOIN "Order" o ON o.id = oi."orderId"
          JOIN "Employee" emp ON emp.id = oit."assignedEmployeeId"
          WHERE oit.status = 'DONE'
            AND o."deletedAt" IS NULL
            AND emp."deletedAt" IS NULL
            ${branchCondition}
          GROUP BY emp.id, emp."fullName"
        ),
        combined_prod AS (
          SELECT label, SUM(value) as value
          FROM (
            SELECT label, value FROM item_prod
            UNION ALL
            SELECT label, value FROM task_prod
          ) s
          GROUP BY label
        )
        SELECT label, value
        FROM combined_prod
        ORDER BY value DESC
        LIMIT 10
      `);
        return result.map((r) => ({ label: r.label, value: Number(r.value) }));
    }
    async getDesignAnalytics(branchId, from, to) {
        const branchCondition = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const dateCondition = from && to
            ? client_1.Prisma.sql `AND o."createdAt" BETWEEN ${new Date(from)} AND ${new Date(to)}`
            : from
                ? client_1.Prisma.sql `AND o."createdAt" >= ${new Date(from)}`
                : to
                    ? client_1.Prisma.sql `AND o."createdAt" <= ${new Date(to)}`
                    : client_1.Prisma.empty;
        const result = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          dt.name,
          COUNT(oi.id) as count,
          SUM(dt."defaultPrice") as revenue,
          SUM(dt."defaultRate") as payout
        FROM "OrderItem" oi
        JOIN "DesignType" dt ON dt.id = oi."designTypeId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE o."deletedAt" IS NULL
          AND oi.status NOT IN ('CANCELLED')
          ${branchCondition}
          ${dateCondition}
        GROUP BY dt.name
        ORDER BY count DESC
      `);
        return result.map((r) => ({
            name: r.name,
            count: Number(r.count),
            revenue: Number(r.revenue),
            payout: Number(r.payout),
        }));
    }
    async getAddonAnalytics(branchId, from, to) {
        const branchCondition = branchId
            ? client_1.Prisma.sql `AND o."branchId" = ${branchId}`
            : client_1.Prisma.empty;
        const dateCondition = from && to
            ? client_1.Prisma.sql `AND o."createdAt" BETWEEN ${new Date(from)} AND ${new Date(to)}`
            : from
                ? client_1.Prisma.sql `AND o."createdAt" >= ${new Date(from)}`
                : to
                    ? client_1.Prisma.sql `AND o."createdAt" <= ${new Date(to)}`
                    : client_1.Prisma.empty;
        const result = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT
          a.type,
          COUNT(a.id) as count,
          SUM(a.price) as total
        FROM "OrderItemAddon" a
        JOIN "OrderItem" oi ON oi.id = a."orderItemId"
        JOIN "Order" o ON o.id = oi."orderId"
        WHERE o."deletedAt" IS NULL
          AND a."deletedAt" IS NULL
          AND oi.status NOT IN ('CANCELLED')
          ${branchCondition}
          ${dateCondition}
        GROUP BY a.type
        ORDER BY total DESC
      `);
        return result.map((r) => ({
            type: r.type,
            count: Number(r.count),
            total: Number(r.total),
        }));
    }
    async getSummary(branchId, from, to) {
        const [designs, addons, dashboard] = await Promise.all([
            this.getDesignAnalytics(branchId, from, to),
            this.getAddonAnalytics(branchId, from, to),
            this.getDashboardStats(branchId),
        ]);
        const totalDesignRevenue = designs.reduce((sum, d) => sum + d.revenue, 0);
        const totalAddonRevenue = addons.reduce((sum, a) => sum + a.total, 0);
        return {
            ...dashboard,
            totalDesignRevenue,
            totalAddonRevenue,
            designs,
            addons,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map