import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(dto: CreateExpenseDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            branchId: string;
            description: string | null;
            categoryId: string;
            amount: number;
            receiptUrl: string | null;
            expenseDate: Date;
            addedById: string;
        };
    }>;
    findAll(req: AuthenticatedRequest, page: string, limit: string, categoryId?: string, from?: string, to?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
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
        success: boolean;
    }>;
    findAllCategories(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
        }[];
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            category: {
                id: string;
                name: string;
                isActive: boolean;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            branchId: string;
            description: string | null;
            categoryId: string;
            amount: number;
            receiptUrl: string | null;
            expenseDate: Date;
            addedById: string;
        };
    }>;
    update(id: string, dto: UpdateExpenseDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            branchId: string;
            description: string | null;
            categoryId: string;
            amount: number;
            receiptUrl: string | null;
            expenseDate: Date;
            addedById: string;
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
}
