import { Role } from '@tbms/shared-types';

// Route prefixes that require authentication in the web app.
export const APP_PROTECTED_PREFIXES = [
  '/',
  '/orders',
  '/customers',
  '/employees',
  '/payments',
  '/expenses',
  '/reports',
  '/settings',
  '/my-orders',
] as const;

export const ADMIN_ONLY_PREFIXES = ['/settings', '/employees/new'] as const;

export const ENTRY_OPERATOR_BLOCKED_PREFIXES = ['/settings'] as const;

export const EMPLOYEE_ALLOWED_PREFIXES = [
  '/my-orders',
  '/profile',
  '/unauthorized',
] as const;

// Canonical reusable role groups (frontend + backend consumption).
export const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN] as const;
export const SUPER_ADMIN_ONLY_ROLES = [Role.SUPER_ADMIN] as const;
export const OPERATOR_ROLES = [Role.ENTRY_OPERATOR, ...ADMIN_ROLES] as const;
export const DASHBOARD_READ_ROLES = [Role.VIEWER, ...OPERATOR_ROLES] as const;
export const EMPLOYEE_SELF_ROLES = [Role.EMPLOYEE] as const;
export const EMPLOYEE_AND_OPERATOR_ROLES = [
  Role.EMPLOYEE,
  ...OPERATOR_ROLES,
] as const;
export const ALL_ROLES = [...DASHBOARD_READ_ROLES, ...EMPLOYEE_SELF_ROLES] as const;

export const DEFAULT_HOME_BY_ROLE: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '/',
  [Role.ADMIN]: '/',
  [Role.ENTRY_OPERATOR]: '/orders',
  [Role.VIEWER]: '/',
  [Role.EMPLOYEE]: '/my-orders',
};

export const FRONTEND_ROUTE_ROLES: Record<string, Role[]> = {
  '/': [...DASHBOARD_READ_ROLES],
  '/my-orders': [...EMPLOYEE_SELF_ROLES],
  '/orders': [...DASHBOARD_READ_ROLES],
  '/customers': [...DASHBOARD_READ_ROLES],
  '/employees': [...DASHBOARD_READ_ROLES],
  '/payments': [...DASHBOARD_READ_ROLES],
  '/expenses': [...DASHBOARD_READ_ROLES],
  '/reports': [...DASHBOARD_READ_ROLES],
  '/settings': [...ADMIN_ROLES],
};
