import { Session } from 'next-auth';
import {
  canRoleAccessPathname,
  getRolePermissions,
  hasAllPermissions,
  hasAnyPermission,
  isRole,
} from '@tbms/shared-constants';
import { Permission, Role } from '@tbms/shared-types';

export function resolveSessionRole(session: Session | null | undefined): Role | null {
  const role = session?.user?.role;
  return isRole(role) ? role : null;
}

export function getSessionPermissions(
  session: Session | null | undefined,
): Permission[] {
  const role = resolveSessionRole(session);
  if (!role) {
    return [];
  }
  return getRolePermissions(role);
}

export function canSessionAccessPathname(
  session: Session | null | undefined,
  pathname: string,
): boolean {
  const role = resolveSessionRole(session);
  if (!role) {
    return false;
  }
  return canRoleAccessPathname(role, pathname);
}

export function sessionHasPermission(
  session: Session | null | undefined,
  permission: Permission,
): boolean {
  const role = resolveSessionRole(session);
  if (!role) {
    return false;
  }
  return hasAllPermissions(role, [permission]);
}

export function sessionHasAllPermissions(
  session: Session | null | undefined,
  permissions: readonly Permission[],
): boolean {
  const role = resolveSessionRole(session);
  if (!role) {
    return false;
  }
  return hasAllPermissions(role, permissions);
}

export function sessionHasAnyPermission(
  session: Session | null | undefined,
  permissions: readonly Permission[],
): boolean {
  const role = resolveSessionRole(session);
  if (!role) {
    return false;
  }
  return hasAnyPermission(role, permissions);
}
