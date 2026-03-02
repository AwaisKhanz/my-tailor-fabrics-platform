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
                    customers: number;
                    employees: number;
                    orders: number;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                code: string;
                address: string | null;
                phone: string | null;
                isActive: boolean;
                deletedAt: Date | null;
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
                customers: number;
                employees: number;
                orders: number;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        };
    }>;
    createBranch(body: CreateBranchInput): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        };
    }>;
    updateBranch(id: string, body: UpdateBranchInput): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
