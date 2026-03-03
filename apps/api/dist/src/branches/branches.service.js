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
exports.BranchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_constants_1 = require("@tbms/shared-constants");
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
let BranchesService = class BranchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeCode(code) {
        return code.trim().toUpperCase();
    }
    normalizePagination(page = DEFAULT_PAGE, limit) {
        if (!Number.isFinite(limit) || (limit ?? 0) <= 0) {
            return null;
        }
        const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
        const safeLimit = Math.min(Math.trunc(limit), MAX_LIMIT);
        return {
            page: safePage,
            limit: safeLimit || DEFAULT_LIMIT,
            skip: (safePage - 1) * (safeLimit || DEFAULT_LIMIT),
        };
    }
    async ensureCodeAvailable(code, excludingId) {
        const existing = await this.prisma.branch.findFirst({
            where: {
                code,
                ...(excludingId ? { id: { not: excludingId } } : {}),
            },
        });
        if (!existing) {
            return;
        }
        if (existing.deletedAt) {
            throw new common_1.ConflictException(`Branch with code '${code}' existed but was deleted. Contact support.`);
        }
        throw new common_1.ConflictException(`Branch with code '${code}' already exists`);
    }
    async findAll({ search, page = 1, limit, } = {}) {
        const where = { deletedAt: null };
        const normalizedSearch = search?.trim();
        const pagination = this.normalizePagination(page, limit);
        if (normalizedSearch) {
            where.OR = [
                { name: { contains: normalizedSearch, mode: 'insensitive' } },
                { code: { contains: normalizedSearch, mode: 'insensitive' } },
            ];
        }
        if (pagination) {
            const { skip, limit: safeLimit } = pagination;
            const [data, total] = await Promise.all([
                this.prisma.branch.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: safeLimit,
                    include: {
                        _count: {
                            select: { employees: true, customers: true, orders: true },
                        },
                    },
                }),
                this.prisma.branch.count({ where }),
            ]);
            return { data, total };
        }
        const data = await this.prisma.branch.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { employees: true, customers: true, orders: true } },
            },
        });
        return { data, total: data.length };
    }
    async findOne(id) {
        const branch = await this.prisma.branch.findFirst({
            where: { id, deletedAt: null },
            include: {
                _count: { select: { employees: true, customers: true, orders: true } },
            },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const totalGarmentTypes = await this.prisma.garmentType.count({
            where: { isActive: true },
        });
        return {
            ...branch,
            stats: {
                totalGarments: totalGarmentTypes,
            },
        };
    }
    async create(data) {
        const normalizedCode = this.normalizeCode(data.code);
        await this.ensureCodeAvailable(normalizedCode);
        return this.prisma.branch.create({
            data: { ...data, code: normalizedCode },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.branch.update({ where: { id }, data });
    }
    async remove(id) {
        const branch = await this.prisma.branch.findUniqueOrThrow({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: {
                            where: {
                                status: {
                                    in: [...shared_constants_1.OPEN_ORDER_STATUSES],
                                },
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });
        if (branch._count.orders > 0) {
            throw new common_1.ConflictException(`Cannot delete branch with ${branch._count.orders} active/overdue orders. Deactivate it instead, or complete/cancel the orders first.`);
        }
        return this.prisma.branch.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async getStats() {
        const [total, active, inactive] = await Promise.all([
            this.prisma.branch.count({ where: { deletedAt: null } }),
            this.prisma.branch.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.branch.count({ where: { deletedAt: null, isActive: false } }),
        ]);
        return { total, active, inactive };
    }
};
exports.BranchesService = BranchesService;
exports.BranchesService = BranchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BranchesService);
//# sourceMappingURL=branches.service.js.map