import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const EXPENSE_SORT_FIELDS: ReadonlyArray<
  keyof Prisma.ExpenseOrderByWithRelationInput
> = ['expenseDate', 'amount', 'createdAt'];

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private requireBranchId(branchId?: string | null): string {
    if (!branchId) {
      throw new BadRequestException(
        'x-branch-id is required for this operation',
      );
    }
    return branchId;
  }

  private parseDateBoundary(value?: string, endOfDay = false): Date | undefined {
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

  private resolveOrderBy(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Prisma.ExpenseOrderByWithRelationInput {
    const field = EXPENSE_SORT_FIELDS.includes(
      sortBy as keyof Prisma.ExpenseOrderByWithRelationInput,
    )
      ? (sortBy as keyof Prisma.ExpenseOrderByWithRelationInput)
      : 'expenseDate';

    return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
  }

  async findAllCategories() {
    return this.prisma.expenseCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  private async assertActiveCategory(categoryId: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: categoryId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }
  }

  async create(branchId: string | null, addedById: string, dto: CreateExpenseDto) {
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

  async findAll(
    branchId: string | null,
    page = 1,
    limit = 20,
    categoryId?: string,
    from?: string,
    to?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const safePage =
      Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(Math.trunc(limit), MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (safePage - 1) * safeLimit;

    const orderBy = this.resolveOrderBy(sortBy, sortOrder);
    const fromDate = this.parseDateBoundary(from);
    const toDate = this.parseDateBoundary(to, true);

    const where: Prisma.ExpenseWhereInput = {
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

  async findOne(id: string, branchId: string | null) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, deletedAt: null, ...(branchId ? { branchId } : {}) },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, branchId: string | null, dto: UpdateExpenseDto) {
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

  async remove(id: string, branchId: string | null) {
    await this.findOne(id, branchId);
    return this.prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
