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
exports.RatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatesService = class RatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findEffectiveRate(branchId, garmentTypeId, stepKey, date = new Date()) {
        let rateCard = await this.prisma.rateCard.findFirst({
            where: {
                branchId,
                garmentTypeId,
                stepKey,
                effectiveFrom: { lte: date },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: date } },
                ],
                deletedAt: null,
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        if (!rateCard) {
            rateCard = await this.prisma.rateCard.findFirst({
                where: {
                    branchId: null,
                    garmentTypeId,
                    stepKey,
                    effectiveFrom: { lte: date },
                    OR: [
                        { effectiveTo: null },
                        { effectiveTo: { gte: date } },
                    ],
                    deletedAt: null,
                },
                orderBy: { effectiveFrom: 'desc' },
            });
        }
        return rateCard;
    }
    async create(dto) {
        return this.prisma.$transaction(async (tx) => {
            const previousRate = await tx.rateCard.findFirst({
                where: {
                    branchId: dto.branchId,
                    garmentTypeId: dto.garmentTypeId,
                    stepKey: dto.stepKey,
                    effectiveTo: null,
                    deletedAt: null,
                },
                orderBy: { effectiveFrom: 'desc' },
            });
            if (previousRate) {
                const effectiveFrom = new Date(dto.effectiveFrom);
                await tx.rateCard.update({
                    where: { id: previousRate.id },
                    data: { effectiveTo: effectiveFrom },
                });
            }
            return tx.rateCard.create({
                data: {
                    branchId: dto.branchId,
                    garmentTypeId: dto.garmentTypeId,
                    stepKey: dto.stepKey,
                    rate: dto.rate,
                    effectiveFrom: new Date(dto.effectiveFrom),
                    stepTemplateId: dto.stepTemplateId,
                },
            });
        });
    }
    async getHistory(garmentTypeId, stepKey, branchId) {
        return this.prisma.rateCard.findMany({
            where: {
                garmentTypeId,
                stepKey,
                branchId: branchId || null,
                deletedAt: null,
            },
            orderBy: { effectiveFrom: 'desc' },
        });
    }
    async findAll(options = {}) {
        const { branchId, search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(branchId ? { branchId } : {}),
        };
        if (search) {
            where.OR = [
                { stepKey: { contains: search, mode: 'insensitive' } },
                { garmentType: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }
        const [total, data] = await Promise.all([
            this.prisma.rateCard.count({ where }),
            this.prisma.rateCard.findMany({
                where,
                include: {
                    garmentType: { select: { name: true } },
                    branch: { select: { name: true, code: true } },
                },
                orderBy: [
                    { garmentType: { name: 'asc' } },
                    { stepKey: 'asc' },
                    { effectiveFrom: 'desc' },
                ],
                skip,
                take: limit,
            }),
        ]);
        return { data, total };
    }
};
exports.RatesService = RatesService;
exports.RatesService = RatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatesService);
//# sourceMappingURL=rates.service.js.map