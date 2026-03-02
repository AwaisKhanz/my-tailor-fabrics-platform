export interface RateCard {
  id: string;
  branchId?: string | null;
  garmentTypeId: string;
  stepTemplateId?: string | null;
  stepKey: string;
  rate: number;
  effectiveFrom: Date | string;
  effectiveTo?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

export interface CreateRateCardInput {
  branchId?: string | null;
  garmentTypeId: string;
  stepTemplateId?: string | null;
  stepKey: string;
  rate: number;
  effectiveFrom: Date | string;
}
