import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllCategories() {
        return this.prisma.expenseCategory.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'desc' }
        });
    }

    async create(branchId: string, addedById: string, dto: CreateExpenseDto) {
        return this.prisma.expense.create({
            data: {
                branchId,
                categoryId: dto.categoryId,
                amount: dto.amount,
                description: dto.description,
                receiptUrl: dto.receiptUrl,
                expenseDate: new Date(dto.expenseDate),
                addedById
            }
        });
    }

    async findAll(
        branchId: string, 
        page = 1, 
        limit = 20, 
        categoryId?: string, 
        from?: string, 
        to?: string,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ) {
        const skip = (page - 1) * limit;

        // Sort logic
        const orderBy: Prisma.ExpenseOrderByWithRelationInput = {};
        if (sortBy) {
            (orderBy as Record<string, 'asc' | 'desc'>)[sortBy] = sortOrder || 'desc';
        } else {
            orderBy.expenseDate = 'desc';
        }
        
        let dateFilter: Prisma.DateTimeFilter | undefined;
        if (from && to) {
            dateFilter = { gte: new Date(from), lte: new Date(to) };
        } else if (from) {
            dateFilter = { gte: new Date(from) };
        } else if (to) {
            dateFilter = { lte: new Date(to) };
        }

        const where: Prisma.ExpenseWhereInput = { deletedAt: null, ...(branchId ? { branchId } : {}) };
        if (categoryId) where.categoryId = categoryId;
        if (dateFilter) where.expenseDate = dateFilter;

        const [data, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true }
            }),
            this.prisma.expense.count({ where })
        ]);

        return {
            data,
            meta: { total, page, lastPage: Math.ceil(total / limit) }
        };
    }

    async findOne(id: string, branchId: string) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
            include: { category: true }
        });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async update(id: string, branchId: string, dto: UpdateExpenseDto) {
        await this.findOne(id, branchId);
        return this.prisma.expense.update({
            where: { id },
            data: {
                ...dto,
                ...(dto.expenseDate ? { expenseDate: new Date(dto.expenseDate) } : {})
            }
        });
    }

    async remove(id: string, branchId: string) {
        await this.findOne(id, branchId);
        return this.prisma.expense.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
