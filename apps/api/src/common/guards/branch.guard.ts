import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@tbms/shared-types';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Super Admin can access any branch, but MUST specify it via header for branch-specific actions
    // If no header is provided and they need one, it will naturally fail at the service level,
    // but the guard passes them.
    if (user.role === Role.SUPER_ADMIN) {
      const targetBranch = request.headers['x-branch-id'];
      request.branchId = targetBranch || null; // Injected for downstream use
      return true;
    }

    // All other roles are strictly scoped to their assigned branch
    if (!user.branchId) {
      throw new ForbiddenException('User is not assigned to any branch');
    }

    // Force inject their assigned branch so services automatically filter by it
    request.branchId = user.branchId;
    return true;
  }
}
