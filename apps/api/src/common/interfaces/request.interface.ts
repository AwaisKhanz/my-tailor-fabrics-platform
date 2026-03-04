import { Request } from 'express';
import { Permission, Role } from '@tbms/shared-types';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    sub?: string;
    email: string;
    role: Role;
    permissions?: Permission[];
    branchId?: string | null;
    employeeId?: string | null;
    refreshToken?: string;
  };
  branchId: string | null;
}
