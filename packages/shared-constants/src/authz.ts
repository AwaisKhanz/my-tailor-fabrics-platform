import {
  Permission,
  PERMISSIONS,
  Role,
  RoutePermissionPolicy,
} from '@tbms/shared-types';

export const PERMISSION = {
  'dashboard.read': 'dashboard.read',
  'orders.read': 'orders.read',
  'orders.create': 'orders.create',
  'orders.update': 'orders.update',
  'orders.financial.manage': 'orders.financial.manage',
  'orders.cancel': 'orders.cancel',
  'orders.share': 'orders.share',
  'orders.receipt': 'orders.receipt',
  'orderItems.manage': 'orderItems.manage',
  'customers.read': 'customers.read',
  'customers.create': 'customers.create',
  'customers.update': 'customers.update',
  'customers.delete': 'customers.delete',
  'customers.measurements.manage': 'customers.measurements.manage',
  'employees.read': 'employees.read',
  'employees.self.read': 'employees.self.read',
  'employees.manage': 'employees.manage',
  'payments.read': 'payments.read',
  'payments.manage': 'payments.manage',
  'expenses.read': 'expenses.read',
  'expenses.manage': 'expenses.manage',
  'reports.read': 'reports.read',
  'reports.export': 'reports.export',
  'settings.read': 'settings.read',
  'settings.manage': 'settings.manage',
  'tasks.read': 'tasks.read',
  'tasks.assign': 'tasks.assign',
  'tasks.update': 'tasks.update',
  'tasks.rate.override': 'tasks.rate.override',
  'rates.read': 'rates.read',
  'rates.manage': 'rates.manage',
  'designTypes.read': 'designTypes.read',
  'designTypes.manage': 'designTypes.manage',
  'garments.read': 'garments.read',
  'garments.manage': 'garments.manage',
  'measurements.read': 'measurements.read',
  'measurements.manage': 'measurements.manage',
  'ledger.read': 'ledger.read',
  'ledger.manage': 'ledger.manage',
  'branch.switch': 'branch.switch',
  'branches.read': 'branches.read',
  'branches.manage': 'branches.manage',
  'users.read': 'users.read',
  'users.manage': 'users.manage',
  'attendance.read': 'attendance.read',
  'attendance.manage': 'attendance.manage',
  'attendance.checkin': 'attendance.checkin',
  'audit.read': 'audit.read',
  'mail.manage': 'mail.manage',
  'system.manage': 'system.manage',
  'search.global': 'search.global',
} as const satisfies Record<Permission, Permission>;

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
    'employees.self.read',
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
    'employees.self.read',
    'reports.read',
    'tasks.read',
    'tasks.update',
    'designTypes.read',
    'garments.read',
    'measurements.read',
    'branches.read',
    'attendance.read',
    'attendance.manage',
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
    'employees.self.read',
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

export const APP_PROTECTED_PREFIXES: readonly string[] = ROUTE_PERMISSION_POLICIES.map(
  (policy) => policy.pathnamePrefix,
);

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
  return typeof value === 'string' && ALL_ROLES.some((role) => role === value);
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

const PERMISSION_UNIVERSE = PERMISSIONS;

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
