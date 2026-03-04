import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@tbms/shared-types';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import type { Request } from 'express';
import { emitSecurityEvent } from '../utils/security-event.util';

type BranchGuardRequest = Request & {
  user?: {
    role?: Role;
    branchId?: string | null;
  };
  branchId?: string | null;
};

@Injectable()
export class BranchGuard implements CanActivate {
  private readonly logger = new Logger(BranchGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<BranchGuardRequest>();
    const user = request.user;

    if (!user?.role) {
      emitSecurityEvent(this.logger, 'branch_scope_denied', {
        reason: 'missing_user_role',
        path: request.originalUrl ?? request.url,
        method: request.method,
        ip: request.ip,
      });
      return false;
    }

    // Super Admin can access any branch, but MUST specify it via header for branch-specific actions
    // If no header is provided and they need one, it will naturally fail at the service level,
    // but the guard passes them.
    if (user.role === Role.SUPER_ADMIN) {
      const rawHeader = request.headers['x-branch-id'];
      const targetBranch = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
      request.branchId =
        typeof targetBranch === 'string' ? targetBranch.trim() || null : null; // Injected for downstream use
      return true;
    }

    // All other roles are strictly scoped to their assigned branch
    if (!user.branchId) {
      emitSecurityEvent(this.logger, 'branch_scope_denied', {
        reason: 'user_without_branch_assignment',
        path: request.originalUrl ?? request.url,
        method: request.method,
        ip: request.ip,
        role: user.role,
      });
      throw new ForbiddenException('User is not assigned to any branch');
    }

    // Force inject their assigned branch so services automatically filter by it
    request.branchId = user.branchId;
    return true;
  }
}
