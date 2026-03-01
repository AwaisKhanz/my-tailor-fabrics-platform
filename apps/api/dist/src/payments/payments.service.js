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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployeeBalanceSummary(employeeId) {
        const [earnedResult, totalPaid] = await Promise.all([
            this.prisma.$queryRaw `
                SELECT COALESCE(SUM("employeeRate" * quantity), 0) AS total
                FROM "OrderItem"
                WHERE "employeeId" = ${employeeId}
                  AND status IN ('COMPLETED', 'DELIVERED')
            `,
            this.prisma.payment.aggregate({
                where: { employeeId, deletedAt: null },
                _sum: { amount: true },
            }),
        ]);
        const totalEarned = Number(earnedResult[0]?.total ?? 0);
        const paid = totalPaid._sum.amount ?? 0;
        const balance = totalEarned - paid;
        return {
            totalEarned,
            totalPaid: paid,
            currentBalance: balance,
            weekly: await this.getWeeklyBreakdown(employeeId),
        };
    }
    async getWeeklyBreakdown(employeeId, weeksBack = 8) {
        return this.prisma.$queryRaw `
            WITH weekly_earned AS (
                SELECT
                    date_trunc('week', "completedAt" AT TIME ZONE 'Asia/Karachi') AS week_start,
                    SUM("employeeRate" * quantity) AS earned
                FROM "OrderItem"
                WHERE "employeeId" = ${employeeId}
                  AND status IN ('COMPLETED', 'DELIVERED')
                  AND "completedAt" >= NOW() - INTERVAL '${weeksBack} weeks'
                  AND "deletedAt" IS NULL
                GROUP BY week_start
            ),
            weekly_paid AS (
                SELECT
                    date_trunc('week', "paidAt" AT TIME ZONE 'Asia/Karachi') AS week_start,
                    SUM(amount) AS paid
                FROM "Payment"
                WHERE "employeeId" = ${employeeId}
                  AND "paidAt" >= NOW() - INTERVAL '${weeksBack} weeks'
                  AND "deletedAt" IS NULL
                GROUP BY week_start
            )
            SELECT
                we.week_start as week_start,
                we.week_start + INTERVAL '6 days' AS week_end,
                COALESCE(we.earned, 0) AS earned,
                COALESCE(wp.paid, 0)   AS paid,
                COALESCE(we.earned, 0) - COALESCE(wp.paid, 0) AS closing_balance
            FROM weekly_earned we
            LEFT JOIN weekly_paid wp USING (week_start)
            ORDER BY week_start DESC
        `;
    }
    async disbursePay(employeeId, amount, processedById, note) {
        const summary = await this.getEmployeeBalanceSummary(employeeId);
        if (amount > summary.currentBalance) {
            throw new common_1.UnprocessableEntityException({
                code: 'PAYMENT_EXCEEDS_BALANCE',
                message: `Cannot disburse ${amount / 100}. Balance is ${summary.currentBalance / 100}`
            });
        }
        return this.prisma.payment.create({
            data: {
                employeeId,
                amount,
                processedById,
                note
            }
        });
    }
    async getHistory(employeeId, page = 1, limit = 20, sortBy, sortOrder) {
        const skip = (page - 1) * limit;
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        }
        else {
            orderBy.paidAt = 'desc';
        }
        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { employeeId, deletedAt: null },
                skip,
                take: limit,
                orderBy
            }),
            this.prisma.payment.count({ where: { employeeId, deletedAt: null } })
        ]);
        return {
            data,
            meta: { total, page, lastPage: Math.ceil(total / limit) }
        };
    }
    async getWeeklyReport() {
        return this.prisma.$queryRaw `
            SELECT
                e.id as "employeeId",
                e."fullName" as "employeeName",
                e."employeeCode" as "employeeCode",
                SUM(p.amount) as "paidThisWeek"
            FROM "Payment" p
            JOIN "Employee" e ON e.id = p."employeeId"
            WHERE p."paidAt" >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Karachi')
            GROUP BY e.id, e."fullName", e."employeeCode"
            ORDER BY "paidThisWeek" DESC
        `;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map