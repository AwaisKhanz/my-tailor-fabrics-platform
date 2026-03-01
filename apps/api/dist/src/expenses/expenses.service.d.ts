import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllCategories(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
    create(branchId: string, addedById: string, dto: CreateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    findAll(branchId: string, page?: number, limit?: number, categoryId?: string, from?: string, to?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            description: string | null;
            categoryId: string;
            amount: number;
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
    findOne(id: string, branchId: string): Promise<{
        category: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    update(id: string, branchId: string, dto: UpdateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
    remove(id: string, branchId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        branchId: string;
        description: string | null;
        categoryId: string;
        amount: number;
        receiptUrl: string | null;
        expenseDate: Date;
        addedById: string;
    }>;
}
