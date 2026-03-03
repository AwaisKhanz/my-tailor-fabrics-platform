import { PrismaService } from '../prisma/prisma.service';
import { CreateRateCardInput } from '@tbms/shared-types';
export declare class RatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findEffectiveRate(branchId: string, garmentTypeId: string, stepKey: string, date?: Date): Promise<{
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
    } | null>;
    create(dto: CreateRateCardInput & {
        createdById: string;
    }): Promise<{
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
    }>;
    getHistory(garmentTypeId: string, stepKey: string, branchId?: string): Promise<{
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
    }[]>;
    findAll(options?: {
        branchId?: string | null;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
        page: number;
        limit: number;
        lastPage: number;
    }>;
}
