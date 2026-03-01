import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@tbms/shared-types';
import { ROLES_KEY, IS_PUBLIC_KEY } from '../decorators/auth.decorators';

const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 50,
  [Role.ADMIN]: 40,
  [Role.ENTRY_OPERATOR]: 30,
  [Role.VIEWER]: 20,
  [Role.EMPLOYEE]: 10,
};

@Injectable()
export class RolesGuard implements CanActivate {
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
      return true; // No roles required, access granted
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || (!user.role)) {
      return false;
    }

    const userRoleValue = ROLE_HIERARCHY[user.role as Role];
    
    // Check if the user meets at least one of the required roles based on hierarchy
    return requiredRoles.some((role) => userRoleValue >= ROLE_HIERARCHY[role]);
  }
}
