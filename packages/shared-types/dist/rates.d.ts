export interface RateCard {
    id: string;
    branchId?: string | null;
    garmentTypeId: string;
    stepTemplateId?: string | null;
    stepKey: string;
    amount: number;
    effectiveFrom: Date | string;
    effectiveTo?: Date | string | null;
    createdById: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string | null;
}
export interface CreateRateCardInput {
    branchId?: string | null;
    garmentTypeId: string;
    stepTemplateId?: string | null;
    stepKey: string;
    amount: number;
    effectiveFrom: Date | string;
    createdById?: string;
}
