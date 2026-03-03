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
const client_1 = require("@prisma/client");
const ledger_service_1 = require("../ledger/ledger.service");
const shared_types_1 = require("@tbms/shared-types");
const MAX_TRANSACTION_RETRIES = 3;
const DEFAULT_HISTORY_PAGE = 1;
const DEFAULT_HISTORY_LIMIT = 20;
const MAX_HISTORY_LIMIT = 100;
const PAYMENT_HISTORY_SORT_FIELDS = ['paidAt', 'createdAt', 'amount'];
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
    async disbursePay(employeeId, amount, processedById, actorBranchId, note) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, deletedAt: null },
            select: { id: true, branchId: true },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        if (actorBranchId && employee.branchId !== actorBranchId) {
            throw new common_1.ForbiddenException('Cannot disburse pay across branches');
        }
        for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
            try {
                return await this.prisma.$transaction(async (tx) => {
                    const aggregate = await tx.employeeLedgerEntry.aggregate({
                        where: { employeeId, deletedAt: null },
                        _sum: { amount: true },
                    });
                    const currentBalance = aggregate._sum.amount ?? 0;
                    if (amount > currentBalance) {
                        throw new common_1.UnprocessableEntityException({
                            code: 'PAYMENT_EXCEEDS_BALANCE',
                            message: `Cannot disburse ${amount / 100}. Balance is ${currentBalance / 100}`,
                        });
                    }
                    const payment = await tx.payment.create({
                        data: { employeeId, amount, processedById, note },
                    });
                    await this.ledgerService.createEntry({
                        employeeId,
                        branchId: employee.branchId,
                        type: shared_types_1.LedgerEntryType.PAYOUT,
                        amount: -amount,
                        paymentId: payment.id,
                        createdById: processedById,
                        note: note || 'Salary payment',
                    }, tx);
                    return payment;
                }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
            }
            catch (error) {
                if (this.isSerializationConflict(error) &&
                    attempt < MAX_TRANSACTION_RETRIES) {
                    continue;
                }
                if (this.isSerializationConflict(error)) {
                    throw new common_1.ConflictException('Concurrent payroll update detected. Please retry.');
                }
                throw error;
            }
        }
        throw new common_1.ConflictException('Unable to process payment at this time');
    }
    parseDateBoundary(value, endOfDay = false) {
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
    isSerializationConflict(error) {
        return (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'P2034');
    }
    resolveOrderBy(sortBy, sortOrder) {
        const field = PAYMENT_HISTORY_SORT_FIELDS.includes(sortBy)
            ? sortBy
            : 'paidAt';
        const direction = sortOrder === 'asc' ? 'asc' : 'desc';
        return { [field]: direction };
    }
    async getHistory(employeeId, page = 1, limit = 20, from, to, sortBy, sortOrder) {
        const safePage = Number.isFinite(page) && page > 0
            ? Math.trunc(page)
            : DEFAULT_HISTORY_PAGE;
        const safeLimit = Number.isFinite(limit) && limit > 0
            ? Math.min(Math.trunc(limit), MAX_HISTORY_LIMIT)
            : DEFAULT_HISTORY_LIMIT;
        const skip = (safePage - 1) * safeLimit;
        const fromDate = this.parseDateBoundary(from);
        const toDate = this.parseDateBoundary(to, true);
        const orderBy = this.resolveOrderBy(sortBy, sortOrder);
        const where = {
            employeeId,
            deletedAt: null,
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
                skip,
                take: safeLimit,
                orderBy,
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            data,
            meta: {
                total,
                page: safePage,
                lastPage: Math.ceil(total / safeLimit),
            },
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