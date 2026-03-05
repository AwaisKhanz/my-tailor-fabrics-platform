import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  UpdateExpenseCategoryDto,
  UpdateExpenseDto,
} from './dto/expense.dto';
import { requireBranchId } from '../common/utils/branch-scope.util';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const EXPENSE_SORT_FIELDS: ReadonlyArray<
  keyof Prisma.ExpenseOrderByWithRelationInput
> = ['expenseDate', 'amount', 'createdAt'];
type ExpenseSortField = (typeof EXPENSE_SORT_FIELDS)[number];

function isExpenseSortField(value?: string): value is ExpenseSortField {
  if (!value) {
    return false;
  }

  return EXPENSE_SORT_FIELDS.some((field) => field === value);
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateBoundary(
    value?: string,
    endOfDay = false,
  ): Date | undefined {
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
    const field: ExpenseSortField = isExpenseSortField(sortBy)
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

  async findAllCategoriesPaginated(
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search?: string,
  ) {
    const pagination = normalizePagination({
      page,
      limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });
    const normalizedSearch = search?.trim();

    const where: Prisma.ExpenseCategoryWhereInput = {
      deletedAt: null,
      ...(normalizedSearch
        ? {
            name: {
              contains: normalizedSearch,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [data, total, activeCount, inactiveCount] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.expenseCategory.count({ where }),
      this.prisma.expenseCategory.count({
        where: {
          deletedAt: null,
          isActive: true,
        },
      }),
      this.prisma.expenseCategory.count({
        where: {
          deletedAt: null,
          isActive: false,
        },
      }),
    ]);

    return {
      ...toPaginatedResponse(data, total, pagination),
      stats: {
        total: activeCount + inactiveCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    };
  }

  private async assertCategoryNameAvailable(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new BadRequestException('Category name is required');
    }

    const existing = await this.prisma.expenseCategory.findFirst({
      where: {
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        name: { equals: normalizedName, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        'Expense category with this name already exists',
      );
    }
  }

  private async findCategoryById(id: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return category;
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    await this.assertCategoryNameAvailable(dto.name);
    return this.prisma.expenseCategory.create({
      data: {
        name: dto.name.trim(),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateExpenseCategoryDto) {
    await this.findCategoryById(id);
    if (dto.name) {
      await this.assertCategoryNameAvailable(dto.name, id);
    }

    return this.prisma.expenseCategory.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(typeof dto.isActive === 'boolean'
          ? { isActive: dto.isActive }
          : {}),
      },
    });
  }

  async removeCategory(id: string) {
    await this.findCategoryById(id);
    return this.prisma.expenseCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
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

  async create(
    branchId: string | null,
    addedById: string,
    dto: CreateExpenseDto,
  ) {
    const scopedBranchId = requireBranchId(branchId);
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
    search?: string,
    categoryId?: string,
    from?: string,
    to?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    const pagination = normalizePagination({
      page,
      limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });

    const orderBy = this.resolveOrderBy(sortBy, sortOrder);
    const fromDate = this.parseDateBoundary(from);
    const toDate = this.parseDateBoundary(to, true);
    const normalizedSearch = search?.trim();

    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              {
                description: {
                  contains: normalizedSearch,
                  mode: 'insensitive',
                },
              },
              {
                category: {
                  name: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
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
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: { category: true },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
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
