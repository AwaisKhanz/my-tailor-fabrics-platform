import { PaginatedResponse, Role } from './common';
export interface UserAccount {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    branchId?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
    branch?: {
        name: string;
        code: string;
    } | null;
}
export interface UserStatsSummary {
    total: number;
    active: number;
    privileged: number;
}
export interface UserAccountsQueryInput {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
    branchId?: string;
}
export type UserAccountsListResult = PaginatedResponse<UserAccount>;
export interface CreateUserInput {
    name: string;
    email: string;
    password?: string;
    role: Role;
    branchId?: string;
}
export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    branchId?: string;
}
