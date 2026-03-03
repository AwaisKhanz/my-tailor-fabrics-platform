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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const EXPENSE_SORT_FIELDS = ['expenseDate', 'amount', 'createdAt'];
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    requireBranchId(branchId) {
        if (!branchId) {
            throw new common_1.BadRequestException('x-branch-id is required for this operation');
        }
        return branchId;
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
    resolveOrderBy(sortBy, sortOrder) {
        const field = EXPENSE_SORT_FIELDS.includes(sortBy)
            ? sortBy
            : 'expenseDate';
        return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    async findAllCategories() {
        return this.prisma.expenseCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }
    async assertActiveCategory(categoryId) {
        const category = await this.prisma.expenseCategory.findFirst({
            where: { id: categoryId, deletedAt: null, isActive: true },
            select: { id: true },
        });
        if (!category) {
            throw new common_1.NotFoundException('Expense category not found');
        }
    }
    async create(branchId, addedById, dto) {
        const scopedBranchId = this.requireBranchId(branchId);
        await this.assertActiveCategory(dto.categoryId);
        return this.prisma.expense.create({
            data: {
                branchId: scopedBranchId,
                categoryId: dto.categoryId,
                amount: dto.amount,
                description: dto.description,
                receiptUrl: dto.receiptUrl,
                expenseDate: new Date(dto.expenseDate),
                addedById,
            },
        });
    }
    async findAll(branchId, page = 1, limit = 20, categoryId, from, to, sortBy, sortOrder) {
        const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
        const safeLimit = Number.isFinite(limit) && limit > 0
            ? Math.min(Math.trunc(limit), MAX_LIMIT)
            : DEFAULT_LIMIT;
        const skip = (safePage - 1) * safeLimit;
        const orderBy = this.resolveOrderBy(sortBy, sortOrder);
        const fromDate = this.parseDateBoundary(from);
        const toDate = this.parseDateBoundary(to, true);
        const where = {
            deletedAt: null,
            ...(branchId ? { branchId } : {}),
            ...(categoryId ? { categoryId } : {}),
            ...(fromDate || toDate
                ? {
                    expenseDate: {
                        ...(fromDate ? { gte: fromDate } : {}),
                        ...(toDate ? { lte: toDate } : {}),
                    },
                }
                : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: safeLimit,
                orderBy,
                include: { category: true },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return {
            data,
            meta: { total, page: safePage, lastPage: Math.ceil(total / safeLimit) },
        };
    }
    async findOne(id, branchId) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
            include: { category: true },
        });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        return expense;
    }
    async update(id, branchId, dto) {
        await this.findOne(id, branchId);
        if (dto.categoryId) {
            await this.assertActiveCategory(dto.categoryId);
        }
        return this.prisma.expense.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.expenseDate ? { expenseDate: new Date(dto.expenseDate) } : {}),
            },
        });
    }
    async remove(id, branchId) {
        await this.findOne(id, branchId);
        return this.prisma.expense.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map