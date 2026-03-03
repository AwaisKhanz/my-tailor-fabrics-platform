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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LedgerService = class LedgerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEntry(dto, tx) {
        const client = tx ?? this.prisma;
        return client.employeeLedgerEntry.create({
            data: {
                employeeId: dto.employeeId,
                branchId: dto.branchId,
                type: dto.type,
                amount: dto.amount,
                orderItemTaskId: dto.orderItemTaskId ?? null,
                paymentId: dto.paymentId ?? null,
                createdById: dto.createdById ?? null,
                note: dto.note ?? null,
            },
        });
    }
    async getBalance(employeeId) {
        const result = await this.prisma.$queryRaw `
      SELECT
        COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS total_earned,
        COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0) AS total_deducted
      FROM "EmployeeLedgerEntry"
      WHERE "employeeId" = ${employeeId}
        AND "deletedAt" IS NULL
    `;
        const totalEarned = Number(result[0]?.total_earned ?? 0);
        const totalDeducted = Number(result[0]?.total_deducted ?? 0);
        return {
            totalEarned,
            totalDeducted: Math.abs(totalDeducted),
            currentBalance: totalEarned + totalDeducted,
        };
    }
    async getStatement(employeeId, options = {}) {
        const { from, to, type, page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;
        const where = {
            employeeId,
            deletedAt: null,
            ...(from || to
                ? {
                    createdAt: {
                        ...(from ? { gte: new Date(from) } : {}),
                        ...(to ? { lte: new Date(to) } : {}),
                    },
                }
                : {}),
            ...(type ? { type: type } : {}),
        };
        const [entries, total, summary] = await Promise.all([
            this.prisma.employeeLedgerEntry.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
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
            this.getBalance(employeeId),
        ]);
        return {
            entries,
            summary,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
    async getEarningsByPeriod(employeeId, weeksBack = 12) {
        const rawData = await this.prisma.$queryRaw `
      WITH period_data AS (
        SELECT
          date_trunc('week', "createdAt" AT TIME ZONE 'Asia/Karachi') AS period,
          SUM(amount) FILTER (WHERE amount > 0) AS earned,
          ABS(SUM(amount) FILTER (WHERE amount < 0)) AS paid
        FROM "EmployeeLedgerEntry"
        WHERE "employeeId" = ${employeeId}
          AND "deletedAt" IS NULL
          AND "createdAt" >= NOW() - (${weeksBack} || ' weeks')::interval
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
    async remove(id, branchId) {
        return this.prisma.employeeLedgerEntry.update({
            where: { id, branchId },
            data: { deletedAt: new Date() },
        });
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map