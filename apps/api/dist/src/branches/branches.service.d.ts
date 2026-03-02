import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchInput, UpdateBranchInput } from '@tbms/shared-types';
export declare class BranchesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll({ search, page, limit }?: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                employees: number;
                customers: number;
                orders: number;
            };
        } & {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            address: string | null;
            phone: string | null;
        })[];
        total: number;
    }>;
    findOne(id: string): Promise<{
        stats: {
            totalGarments: number;
        };
        _count: {
            employees: number;
            customers: number;
            orders: number;
        };
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        address: string | null;
        phone: string | null;
    }>;
    create(data: CreateBranchInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        address: string | null;
        phone: string | null;
    }>;
    update(id: string, data: UpdateBranchInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        address: string | null;
        phone: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        address: string | null;
        phone: string | null;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
}
