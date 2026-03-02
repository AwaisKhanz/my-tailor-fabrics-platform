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
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                branchId: string | null;
                isActive: boolean;
                lastLoginAt: Date | null;
                createdAt: Date;
                branch: {
                    name: string;
                    code: string;
                } | null;
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
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    setActive(id: string, isActive: boolean): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            employeeId: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            refreshToken: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    update(id: string, body: UpdateUserInput): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
}
