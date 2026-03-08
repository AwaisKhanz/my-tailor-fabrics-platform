import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  hasAllPermissions,
  hasAnyPermission,
  isRole,
} from '@tbms/shared-constants';
import { Permission, Role } from '@tbms/shared-types';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from '../decorators/permissions.decorator';
import type { Request } from 'express';
import { emitSecurityEvent } from '../utils/security-event.util';

type PermissionGuardRequest = Request & {
  user?: {
    role?: Role;
  };
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  private logDenied(
    reason: string,
    request: PermissionGuardRequest,
    requireAll: readonly Permission[],
    requireAny: readonly Permission[],
  ) {
    emitSecurityEvent(this.logger, 'permission_denied', {
      reason,
      path: request.originalUrl ?? request.url,
      method: request.method,
      ip: request.ip,
      role: request.user?.role ?? null,
      requireAll,
      requireAny,
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requireAll =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_ALL_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const requireAny =
      this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_ANY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requireAll.length === 0 && requireAny.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<PermissionGuardRequest>();
    const role = request.user?.role;

    if (!isRole(role)) {
      this.logDenied(
        'invalid_or_missing_role',
        request,
        requireAll,
        requireAny,
      );
      return false;
    }

    if (!hasAllPermissions(role, requireAll)) {
      this.logDenied(
        'missing_required_all_permissions',
        request,
        requireAll,
        requireAny,
      );
      return false;
    }

    if (!hasAnyPermission(role, requireAny)) {
      this.logDenied(
        'missing_required_any_permissions',
        request,
        requireAll,
        requireAny,
      );
      return false;
    }

    return true;
  }
}
