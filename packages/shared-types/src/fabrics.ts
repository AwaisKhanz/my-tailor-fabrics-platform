import { PaginatedResponse } from './common';

export interface ShopFabric {
  id: string;
  branchId: string;
  name: string;
  brand?: string | null;
  code?: string | null;
  sellingRate: number;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateShopFabricInput {
  branchId?: string;
  name: string;
  brand?: string;
  code?: string;
  sellingRate: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateShopFabricInput {
  branchId?: string;
  name?: string;
  brand?: string;
  code?: string;
  sellingRate?: number;
  isActive?: boolean;
  notes?: string;
}

export interface ShopFabricListQueryInput {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
  includeArchived?: boolean;
}

export type ShopFabricListResult = PaginatedResponse<ShopFabric>;

export interface ShopFabricStatsSummary {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
}
