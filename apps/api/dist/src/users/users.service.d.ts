import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        branch: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            address: string | null;
            phone: string | null;
        } | null;
    } & {
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
    }) | null>;
    findById(id: string): Promise<({
        branch: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            address: string | null;
            phone: string | null;
        } | null;
    } & {
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
    }) | null>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<{
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
    }>;
    findAll(branchId?: string): Promise<{
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
    }>;
    setupInitialSuperAdmin(data: CreateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    create(data: CreateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    setActive(id: string, isActive: boolean): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    update(id: string, dataParams: UpdateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        privileged: number;
    }>;
}
