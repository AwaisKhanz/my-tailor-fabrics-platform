import { Request } from 'express';
import { Role } from '@tbms/shared-types';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: Role;
    branchId?: string | null;
    employeeId?: string | null;
  };
  branchId: string;
}
