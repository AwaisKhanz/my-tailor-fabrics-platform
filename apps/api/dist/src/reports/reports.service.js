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
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(branchId) {
        const baseOrderWhere = branchId ? { branchId, deletedAt: null } : { deletedAt: null };
        const baseExpenseWhere = branchId ? { branchId, deletedAt: null } : { deletedAt: null };
        const revenue = await this.prisma.orderPayment.aggregate({
            _sum: { amount: true },
            where: { order: baseOrderWhere }
        });
        const expenses = await this.prisma.expense.aggregate({
            _sum: { amount: true },
            where: baseExpenseWhere
        });
        const earnedCondition = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const totalEarnedQuery = await this.prisma.$queryRawUnsafe(`
            SELECT COALESCE(SUM(oi."employeeRate" * oi.quantity), 0) AS total
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            WHERE oi.status IN ('COMPLETED', 'DELIVERED')
            AND o."deletedAt" IS NULL
            ${earnedCondition}
        `);
        const employeeCondition = branchId ? { employee: { branchId, deletedAt: null } } : { employee: { deletedAt: null } };
        const totalPaid = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: employeeCondition
        });
        const totalEarned = Number(totalEarnedQuery[0]?.total ?? 0);
        const paidOut = totalPaid._sum.amount ?? 0;
        const outstandingBalances = totalEarned - paidOut;
        const overdueOrders = await this.prisma.order.count({
            where: {
                ...baseOrderWhere,
                status: shared_types_1.OrderStatus.OVERDUE
            }
        });
        return {
            revenue: revenue._sum.amount ?? 0,
            expenses: expenses._sum.amount ?? 0,
            outstandingBalances,
            overdueOrders
        };
    }
    async getRevenueVsExpenses(branchId, months = 6) {
        const branchConditionOrder = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const branchConditionExpense = branchId ? `AND e."branchId" = '${branchId}'` : '';
        const revenueRaw = await this.prisma.$queryRawUnsafe(`
            SELECT date_trunc('month', op."paidAt") as month, SUM(op.amount) as total
            FROM "OrderPayment" op
            JOIN "Order" o ON o.id = op."orderId"
            WHERE op."paidAt" >= NOW() - INTERVAL '${months} months'
            AND o."deletedAt" IS NULL
            ${branchConditionOrder}
            GROUP BY month
            ORDER BY month ASC
        `);
        const expenseRaw = await this.prisma.$queryRawUnsafe(`
            SELECT date_trunc('month', e."expenseDate") as month, SUM(e.amount) as total
            FROM "Expense" e
            WHERE e."expenseDate" >= NOW() - INTERVAL '${months} months'
            AND e."deletedAt" IS NULL
            ${branchConditionExpense}
            GROUP BY month
            ORDER BY month ASC
        `);
        return {
            revenue: revenueRaw.map(r => ({ month: r.month, total: Number(r.total) })),
            expenses: expenseRaw.map(e => ({ month: e.month, total: Number(e.total) })),
        };
    }
    async getGarmentTypesRevenue(branchId) {
        const branchCondition = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const result = await this.prisma.$queryRawUnsafe(`
            SELECT oi."garmentTypeName" as label, SUM(oi."unitPrice" * oi.quantity) as value
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            WHERE oi.status NOT IN ('CANCELLED')
            AND o."deletedAt" IS NULL
            ${branchCondition}
            GROUP BY oi."garmentTypeName"
            ORDER BY value DESC
        `);
        return result.map(r => ({ label: r.label, value: Number(r.value) }));
    }
    async getEmployeeProductivity(branchId) {
        const branchCondition = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const result = await this.prisma.$queryRawUnsafe(`
            SELECT emp."fullName" as label, SUM(oi.quantity) as value
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            JOIN "Employee" emp ON emp.id = oi."employeeId"
            WHERE oi.status IN ('COMPLETED', 'DELIVERED')
            AND o."deletedAt" IS NULL
            AND emp."deletedAt" IS NULL
            ${branchCondition}
            GROUP BY emp.id, emp."fullName"
            ORDER BY value DESC
            LIMIT 10
        `);
        return result.map(r => ({ label: r.label, value: Number(r.value) }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map