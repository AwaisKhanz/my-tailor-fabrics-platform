import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    refresh(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: AuthenticatedRequest): {
        success: boolean;
        data: {
            userId: string;
            email: string;
            role: import("@tbms/shared-types").Role;
            branchId?: string | null;
            employeeId?: string | null;
        };
    };
}
