import { UsersService } from './users.service';
import type { CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(branchId?: string): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                createdAt: Date;
                name: string;
                isActive: boolean;
                branch: {
                    name: string;
                    code: string;
                } | null;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                branchId: string | null;
                lastLoginAt: Date | null;
            }[];
            total: number;
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            privileged: number;
        };
    }>;
    create(body: CreateUserInput): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            branch: {
                name: string;
                code: string;
            } | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            lastLoginAt: Date | null;
        };
    }>;
    setActive(id: string, isActive: boolean): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            deletedAt: Date | null;
            email: string;
            employeeId: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            lastLoginAt: Date | null;
            refreshToken: string | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    update(id: string, body: UpdateUserInput): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            name: string;
            isActive: boolean;
            branch: {
                name: string;
                code: string;
            } | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            lastLoginAt: Date | null;
        };
    }>;
}
