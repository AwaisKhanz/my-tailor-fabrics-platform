import { RatesService } from './rates.service';
import { Role } from '@tbms/shared-types';
import type { CreateRateCardInput } from '@tbms/shared-types';
export declare class RatesController {
    private readonly ratesService;
    constructor(ratesService: RatesService);
    findAll(req: {
        user: {
            role: Role;
            branchId: string;
        };
    }, page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: ({
            branch: {
                name: string;
                code: string;
            } | null;
            garmentType: {
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string | null;
            garmentTypeId: string;
            stepKey: string;
            stepTemplateId: string | null;
            amount: number;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            createdById: string;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    create(dto: CreateRateCardInput, req: {
        user: {
            id: string;
            role: Role;
            branchId: string;
        };
    }): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string | null;
            garmentTypeId: string;
            stepKey: string;
            stepTemplateId: string | null;
            amount: number;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            createdById: string;
        };
    }>;
    getHistory(garmentTypeId: string, stepKey: string, branchId?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string | null;
            garmentTypeId: string;
            stepKey: string;
            stepTemplateId: string | null;
            amount: number;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            createdById: string;
        }[];
    }>;
}
