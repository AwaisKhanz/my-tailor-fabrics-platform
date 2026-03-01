import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        branch: {
            id: string;
            code: string;
            name: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }) | null>;
    findById(id: string): Promise<({
        branch: {
            id: string;
            code: string;
            name: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        } | null;
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }) | null>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
    findAll(branchId?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        branch: {
            code: string;
            name: string;
        } | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
    }[]>;
    setupInitialSuperAdmin(data: CreateUserInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
    }>;
    create(data: CreateUserInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
    }>;
    setActive(id: string, isActive: boolean): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
    update(id: string, dataParams: UpdateUserInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        privileged: number;
    }>;
}
