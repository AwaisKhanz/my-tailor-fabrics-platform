import { Permission, Role, RoutePermissionPolicy } from '@tbms/shared-types';

export const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN] as const;
export const SUPER_ADMIN_ONLY_ROLES = [Role.SUPER_ADMIN] as const;
export const STAFF_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.ENTRY_OPERATOR,
  Role.EMPLOYEE,
] as const;
export const MANAGEMENT_ROLES = [Role.SUPER_ADMIN, Role.ADMIN] as const;
export const OPERATOR_ROLES = [Role.ENTRY_OPERATOR, ...ADMIN_ROLES] as const;
export const DASHBOARD_READ_ROLES = [Role.VIEWER, ...OPERATOR_ROLES] as const;
export const EMPLOYEE_SELF_ROLES = [Role.EMPLOYEE] as const;
export const EMPLOYEE_AND_OPERATOR_ROLES = [
  Role.EMPLOYEE,
  ...OPERATOR_ROLES,
] as const;
export const ALL_ROLES = [...DASHBOARD_READ_ROLES, ...EMPLOYEE_SELF_ROLES] as const;

const rolePermissionMatrix: Record<Role, readonly Permission[]> = {
  [Role.SUPER_ADMIN]: [],
  [Role.ADMIN]: [
    'dashboard.read',
    'orders.read',
    'orders.create',
    'orders.update',
    'orders.financial.manage',
    'orders.cancel',
    'orders.share',
    'orders.receipt',
    'orderItems.manage',
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.delete',
    'customers.measurements.manage',
    'employees.read',
    'employees.manage',
    'payments.read',
    'payments.manage',
    'expenses.read',
    'expenses.manage',
    'reports.read',
    'reports.export',
    'settings.read',
    'settings.manage',
    'tasks.read',
    'tasks.assign',
    'tasks.update',
    'tasks.rate.override',
    'rates.read',
    'rates.manage',
    'designTypes.read',
    'designTypes.manage',
    'garments.read',
    'garments.manage',
    'measurements.read',
    'measurements.manage',
    'ledger.read',
    'ledger.manage',
    'branches.read',
    'branches.manage',
    'attendance.read',
    'attendance.manage',
    'attendance.checkin',
    'audit.read',
    'appearance.manage',
    'integrations.manage',
    'system.manage',
    'search.global',
  ],
  [Role.ENTRY_OPERATOR]: [
    'dashboard.read',
    'orders.read',
    'orders.create',
    'orders.update',
    'orders.share',
    'orders.receipt',
    'orderItems.manage',
    'customers.read',
    'customers.create',
    'customers.update',
    'customers.measurements.manage',
    'employees.read',
    'reports.read',
    'tasks.read',
    'tasks.update',
    'designTypes.read',
    'garments.read',
    'measurements.read',
    'branches.read',
    'attendance.read',
    'attendance.checkin',
    'search.global',
  ],
  [Role.VIEWER]: [
    'dashboard.read',
    'orders.read',
    'orders.receipt',
    'reports.read',
    'tasks.read',
    'attendance.read',
  ],
  [Role.EMPLOYEE]: [
    'orders.read',
    'tasks.read',
    'tasks.update',
    'attendance.checkin',
  ],
};

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> =
  rolePermissionMatrix;

export const DEFAULT_HOME_BY_ROLE: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '/',
  [Role.ADMIN]: '/',
  [Role.ENTRY_OPERATOR]: '/orders',
  [Role.VIEWER]: '/',
  [Role.EMPLOYEE]: '/my-orders',
};

export const ROUTE_PERMISSION_POLICIES: readonly RoutePermissionPolicy[] = [
  { pathnamePrefix: '/settings/users', requireAll: ['settings.read', 'users.manage'] },
  { pathnamePrefix: '/settings/system', requireAll: ['settings.read', 'system.manage'] },
  { pathnamePrefix: '/settings/integrations', requireAll: ['settings.read', 'mail.manage'] },
  { pathnamePrefix: '/settings/audit-logs', requireAll: ['settings.read', 'audit.read'] },
  { pathnamePrefix: '/settings/attendance', requireAll: ['settings.read', 'attendance.read'] },
  { pathnamePrefix: '/settings/appearance', requireAll: ['settings.read', 'appearance.manage'] },
  { pathnamePrefix: '/settings/branches', requireAll: ['settings.read', 'branches.read'] },
  { pathnamePrefix: '/settings/garments', requireAll: ['settings.read', 'garments.read'] },
  { pathnamePrefix: '/settings/measurements', requireAll: ['settings.read', 'measurements.read'] },
  { pathnamePrefix: '/settings/rates', requireAll: ['settings.read', 'rates.read'] },
  { pathnamePrefix: '/settings/design-types', requireAll: ['settings.read', 'designTypes.read'] },
  { pathnamePrefix: '/settings/expense-categories', requireAll: ['settings.read', 'expenses.read'] },
  { pathnamePrefix: '/settings', requireAll: ['settings.read'] },
  { pathnamePrefix: '/reports', requireAll: ['reports.read'] },
  { pathnamePrefix: '/expenses', requireAll: ['expenses.manage'] },
  { pathnamePrefix: '/payments', requireAll: ['payments.manage'] },
  { pathnamePrefix: '/employees', requireAll: ['employees.read'] },
  { pathnamePrefix: '/customers', requireAll: ['customers.read'] },
  { pathnamePrefix: '/orders/new', requireAll: ['orders.create'] },
  { pathnamePrefix: '/orders', requireAll: ['orders.read'] },
  { pathnamePrefix: '/my-orders', requireAll: ['orders.read'] },
  { pathnamePrefix: '/', requireAll: ['dashboard.read'] },
];

export const FRONTEND_ROUTE_PERMISSIONS: Record<string, readonly Permission[]> = {
  '/': ['dashboard.read'],
  '/my-orders': ['orders.read'],
  '/orders': ['orders.read'],
  '/customers': ['customers.read'],
  '/employees': ['employees.read'],
  '/payments': ['payments.manage'],
  '/expenses': ['expenses.manage'],
  '/reports': ['reports.read'],
  '/settings': ['settings.read'],
};

export const APP_PROTECTED_PREFIXES = ROUTE_PERMISSION_POLICIES.map(
  (policy) => policy.pathnamePrefix,
) as readonly string[];

export const EMPLOYEE_ALLOWED_PREFIXES = [
  '/my-orders',
  '/profile',
  '/unauthorized',
] as const;

export const ADMIN_ONLY_PREFIXES = ['/settings/users', '/settings/system', '/settings/integrations'] as const;

export const ENTRY_OPERATOR_BLOCKED_PREFIXES = [
  '/settings/users',
  '/settings/system',
  '/settings/integrations',
  '/settings/audit-logs',
] as const;

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (Object.values(Role) as string[]).includes(value);
}

export function getRolePermissions(role: Role): Permission[] {
  if (role === Role.SUPER_ADMIN) {
    return [...PERMISSION_UNIVERSE];
  }
  return [...ROLE_PERMISSIONS[role]];
}

export function hasAllPermissions(
  role: Role,
  required: readonly Permission[] = [],
): boolean {
  if (required.length === 0) {
    return true;
  }
  const rolePermissions = new Set(getRolePermissions(role));
  return required.every((permission) => rolePermissions.has(permission));
}

export function hasAnyPermission(
  role: Role,
  required: readonly Permission[] = [],
): boolean {
  if (required.length === 0) {
    return true;
  }
  const rolePermissions = new Set(getRolePermissions(role));
  return required.some((permission) => rolePermissions.has(permission));
}

export function resolveRoutePermissionPolicy(
  pathname: string,
): RoutePermissionPolicy | undefined {
  const normalized = pathname.trim() || '/';
  const sorted = [...ROUTE_PERMISSION_POLICIES].sort(
    (a, b) => b.pathnamePrefix.length - a.pathnamePrefix.length,
  );

  return sorted.find((policy) => {
    if (policy.pathnamePrefix === '/') {
      return normalized === '/';
    }
    return (
      normalized === policy.pathnamePrefix ||
      normalized.startsWith(`${policy.pathnamePrefix}/`)
    );
  });
}

export function canRoleAccessPathname(role: Role, pathname: string): boolean {
  const policy = resolveRoutePermissionPolicy(pathname);
  if (!policy) {
    return true;
  }
  if (policy.requireAll && !hasAllPermissions(role, policy.requireAll)) {
    return false;
  }
  if (policy.requireAny && !hasAnyPermission(role, policy.requireAny)) {
    return false;
  }
  return true;
}

const PERMISSION_UNIVERSE = [
  'dashboard.read',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.financial.manage',
  'orders.cancel',
  'orders.share',
  'orders.receipt',
  'orderItems.manage',
  'customers.read',
  'customers.create',
  'customers.update',
  'customers.delete',
  'customers.measurements.manage',
  'employees.read',
  'employees.manage',
  'payments.read',
  'payments.manage',
  'expenses.read',
  'expenses.manage',
  'reports.read',
  'reports.export',
  'settings.read',
  'settings.manage',
  'tasks.read',
  'tasks.assign',
  'tasks.update',
  'tasks.rate.override',
  'rates.read',
  'rates.manage',
  'designTypes.read',
  'designTypes.manage',
  'garments.read',
  'garments.manage',
  'measurements.read',
  'measurements.manage',
  'ledger.read',
  'ledger.manage',
  'branch.switch',
  'branches.read',
  'branches.manage',
  'users.read',
  'users.manage',
  'attendance.read',
  'attendance.manage',
  'attendance.checkin',
  'audit.read',
  'integrations.manage',
  'mail.manage',
  'system.manage',
  'appearance.manage',
  'search.global',
] as const satisfies readonly Permission[];

export const FRONTEND_ROUTE_ROLES: Record<string, Role[]> = {
  '/': [...DASHBOARD_READ_ROLES],
  '/my-orders': [...EMPLOYEE_SELF_ROLES],
  '/orders': [...DASHBOARD_READ_ROLES],
  '/customers': [...OPERATOR_ROLES],
  '/employees': [...OPERATOR_ROLES],
  '/payments': [...ADMIN_ROLES],
  '/expenses': [...ADMIN_ROLES],
  '/reports': [...DASHBOARD_READ_ROLES],
  '/settings': [...ADMIN_ROLES],
};
