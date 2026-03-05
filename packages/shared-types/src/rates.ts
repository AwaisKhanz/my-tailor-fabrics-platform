import { PaginatedResponse } from './common';

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

export interface RateStatsSummary {
  total: number;
  global: number;
  branchScoped: number;
}

export interface RateCardsListQueryInput {
  search?: string;
  page?: number;
  limit?: number;
}

export type RateCardsListResult = PaginatedResponse<RateCard>;

export interface RateStatsQueryInput {
  search?: string;
}

export interface RateHistoryQueryInput {
  garmentTypeId: string;
  stepKey: string;
  branchId?: string | null;
}
