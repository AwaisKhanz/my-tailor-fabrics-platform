import { RatesService } from './rates.service';
import type { CreateRateCardInput } from '@tbms/shared-types';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
export declare class RatesController {
    private readonly ratesService;
    constructor(ratesService: RatesService);
    findAll(req: AuthenticatedRequest, page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: {
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
            total: number;
        };
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    create(dto: CreateRateCardInput, req: AuthenticatedRequest): Promise<{
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
    getHistory(req: AuthenticatedRequest, garmentTypeId: string, stepKey: string, branchId?: string): Promise<{
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
