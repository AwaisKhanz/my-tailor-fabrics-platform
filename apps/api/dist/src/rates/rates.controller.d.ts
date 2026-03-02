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
            branchId: string | null;
            garmentTypeId: string;
            stepTemplateId: string | null;
            stepKey: string;
            rate: number;
            effectiveFrom: Date;
            effectiveTo: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    create(dto: CreateRateCardInput, req: {
        user: {
            role: Role;
            branchId: string;
        };
    }): Promise<{
        id: string;
        branchId: string | null;
        garmentTypeId: string;
        stepTemplateId: string | null;
        stepKey: string;
        rate: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    getHistory(garmentTypeId: string, stepKey: string, branchId?: string): Promise<{
        id: string;
        branchId: string | null;
        garmentTypeId: string;
        stepTemplateId: string | null;
        stepKey: string;
        rate: number;
        effectiveFrom: Date;
        effectiveTo: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
}
