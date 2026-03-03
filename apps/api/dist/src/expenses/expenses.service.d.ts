import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private requireBranchId;
    private parseDateBoundary;
    private resolveOrderBy;
    findAllCategories(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        deletedAt: Date | null;
    }[]>;
    private assertActiveCategory;
    create(branchId: string | null, addedById: string, dto: CreateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        amount: number;
        categoryId: string;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    findAll(branchId: string | null, page?: number, limit?: number, categoryId?: string, from?: string, to?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            description: string | null;
            amount: number;
            categoryId: string;
            receiptUrl: string | null;
            expenseDate: Date;
            addedById: string;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string, branchId: string | null): Promise<{
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        amount: number;
        categoryId: string;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    update(id: string, branchId: string | null, dto: UpdateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        amount: number;
        categoryId: string;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    remove(id: string, branchId: string | null): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        amount: number;
        categoryId: string;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
}
