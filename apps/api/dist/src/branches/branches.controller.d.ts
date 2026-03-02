import { BranchesService } from './branches.service';
import type { CreateBranchInput, UpdateBranchInput } from '@tbms/shared-types';
export declare class BranchesController {
    private readonly branchesService;
    constructor(branchesService: BranchesService);
    findAll(page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            inactive: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    createBranch(body: CreateBranchInput): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            address: string | null;
            phone: string | null;
        };
    }>;
    updateBranch(id: string, body: UpdateBranchInput): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            address: string | null;
            phone: string | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
