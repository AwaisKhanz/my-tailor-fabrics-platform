import { PrismaService } from '../prisma/prisma.service';
import { CreateRateCardInput } from '@tbms/shared-types';
export declare class RatesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findEffectiveRate(branchId: string, garmentTypeId: string, stepKey: string, date?: Date): Promise<{
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
    } | null>;
    create(dto: CreateRateCardInput): Promise<{
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
        total: number;
    }>;
}
