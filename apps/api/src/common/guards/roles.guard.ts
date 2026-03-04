import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission, Role } from '@tbms/shared-types';
import { ROLES_KEY, IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from '../decorators/permissions.decorator';
import type { Request } from 'express';
import { emitSecurityEvent } from '../utils/security-event.util';

type RolesGuardRequest = Request & {
  user?: {
    role?: Role;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      const requiredPermissionsAll =
        this.reflector.getAllAndOverride<Permission[]>(
          PERMISSIONS_ALL_KEY,
          [context.getHandler(), context.getClass()],
        ) ?? [];
      const requiredPermissionsAny =
        this.reflector.getAllAndOverride<Permission[]>(
          PERMISSIONS_ANY_KEY,
          [context.getHandler(), context.getClass()],
        ) ?? [];
      const allowByPermissionsMetadata =
        requiredPermissionsAll.length > 0 || requiredPermissionsAny.length > 0
      if (!allowByPermissionsMetadata) {
        const request = context.switchToHttp().getRequest<RolesGuardRequest>();
        emitSecurityEvent(this.logger, 'role_denied', {
          reason: 'missing_authorization_metadata',
          path: request.originalUrl ?? request.url,
          method: request.method,
          ip: request.ip,
          role: request.user?.role ?? null,
        });
      }
      return allowByPermissionsMetadata;
    }

    const request = context.switchToHttp().getRequest<RolesGuardRequest>();
    const userRole = request.user?.role;

    if (!userRole) {
      emitSecurityEvent(this.logger, 'role_denied', {
        reason: 'missing_user_role',
        path: request.originalUrl ?? request.url,
        method: request.method,
        ip: request.ip,
        requiredRoles,
      });
      return false;
    }

    // Explicit role membership check (no implicit hierarchy escalation).
    const allowed = requiredRoles.includes(userRole);
    if (!allowed) {
      emitSecurityEvent(this.logger, 'role_denied', {
        reason: 'role_not_allowed',
        path: request.originalUrl ?? request.url,
        method: request.method,
        ip: request.ip,
        role: userRole,
        requiredRoles,
      });
    }
    return allowed;
  }
}
