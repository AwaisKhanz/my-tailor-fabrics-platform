import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    } | null>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            branchId: string | null;
            employeeId: string | null;
        };
    }>;
    logout(userId: string): Promise<{
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
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
