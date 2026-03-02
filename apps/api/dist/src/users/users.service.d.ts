import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        } | null;
    } & {
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
    }) | null>;
    findById(id: string): Promise<({
        branch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            phone: string | null;
            isActive: boolean;
            deletedAt: Date | null;
        } | null;
    } & {
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
    }) | null>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<{
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
    }>;
    findAll(branchId?: string): Promise<{
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
    }>;
    setupInitialSuperAdmin(data: CreateUserInput): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
    }>;
    create(data: CreateUserInput): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
    }>;
    setActive(id: string, isActive: boolean): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    update(id: string, dataParams: UpdateUserInput): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
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
