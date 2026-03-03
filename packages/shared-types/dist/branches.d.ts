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
    };
}
export interface BranchDetailStats {
    totalGarments: number;
    activeEmployees: number;
    activeCustomers: number;
    openOrders: number;
    completedOrders: number;
    branchRateCards: number;
    globalRateCards: number;
    hasBranchRateOverrides: boolean;
}
export interface BranchDetail extends Branch {
    stats: BranchDetailStats;
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
}
export interface BranchStatsSummary {
    total: number;
    active: number;
    inactive: number;
}
