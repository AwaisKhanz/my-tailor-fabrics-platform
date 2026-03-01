export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    employees: number;
    customers: number;
    orders: number;
    priceOverrides: number;
  };
}

export interface CreateBranchInput {
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  pickupDiscount?: number;
  rushCapability?: boolean;
  taxRate?: number;
  taxInclusive?: boolean;
}
