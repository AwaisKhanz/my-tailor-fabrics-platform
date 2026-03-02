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
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCategories() {
        return this.prisma.expenseCategory.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'desc' },
        });
    }
    async create(branchId, addedById, dto) {
        return this.prisma.expense.create({
            data: {
                branchId,
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
        const skip = (page - 1) * limit;
        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        }
        else {
            orderBy.expenseDate = 'desc';
        }
        let dateFilter;
        if (from && to) {
            dateFilter = { gte: new Date(from), lte: new Date(to) };
        }
        else if (from) {
            dateFilter = { gte: new Date(from) };
        }
        else if (to) {
            dateFilter = { lte: new Date(to) };
        }
        const where = {
            deletedAt: null,
            ...(branchId ? { branchId } : {}),
        };
        if (categoryId)
            where.categoryId = categoryId;
        if (dateFilter)
            where.expenseDate = dateFilter;
        const [data, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true },
            }),
            this.prisma.expense.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, lastPage: Math.ceil(total / limit) },
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