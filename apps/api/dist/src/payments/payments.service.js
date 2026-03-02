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
const ledger_service_1 = require("../ledger/ledger.service");
const shared_types_1 = require("@tbms/shared-types");
let PaymentsService = class PaymentsService {
    prisma;
    ledgerService;
    constructor(prisma, ledgerService) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
    }
    async getEmployeeBalanceSummary(employeeId) {
        const balance = await this.ledgerService.getBalance(employeeId);
        const weekly = await this.getWeeklyBreakdown(employeeId);
        return {
            totalEarned: balance.totalEarned,
            totalPaid: balance.totalDeducted,
            currentBalance: balance.currentBalance,
            weekly,
        };
    }
    async getWeeklyBreakdown(employeeId, weeksBack = 8) {
        const earnings = await this.ledgerService.getEarningsByPeriod(employeeId, weeksBack);
        return earnings.map((item) => ({
            week_start: item.period,
            earned: item.earned,
            paid: item.paid,
            closing_balance: item.closingBalance,
        }));
    }
    async disbursePay(employeeId, amount, processedById, branchId, note) {
        const summary = await this.getEmployeeBalanceSummary(employeeId);
        if (amount > summary.currentBalance) {
            throw new common_1.UnprocessableEntityException({
                code: 'PAYMENT_EXCEEDS_BALANCE',
                message: `Cannot disburse ${amount / 100}. Balance is ${summary.currentBalance / 100}`,
            });
        }
        const payment = await this.prisma.payment.create({
            data: { employeeId, amount, processedById, note },
        });
        await this.ledgerService.createEntry({
            employeeId,
            branchId,
            type: shared_types_1.LedgerEntryType.PAYOUT,
            amount: -amount,
            paymentId: payment.id,
            createdById: processedById,
            note: note || 'Salary payment',
        });
        return payment;
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
                orderBy,
            }),
            this.prisma.payment.count({ where: { employeeId, deletedAt: null } }),
        ]);
        return {
            data,
            meta: { total, page, lastPage: Math.ceil(total / limit) },
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map