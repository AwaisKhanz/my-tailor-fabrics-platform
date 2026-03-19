"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_ROUTE_ROLES = exports.ENTRY_OPERATOR_BLOCKED_PREFIXES = exports.ADMIN_ONLY_PREFIXES = exports.EMPLOYEE_ALLOWED_PREFIXES = exports.APP_PROTECTED_PREFIXES = exports.FRONTEND_ROUTE_PERMISSIONS = exports.ROUTE_PERMISSION_POLICIES = exports.DEFAULT_HOME_BY_ROLE = exports.ROLE_PERMISSIONS = exports.ALL_ROLES = exports.EMPLOYEE_AND_OPERATOR_ROLES = exports.EMPLOYEE_SELF_ROLES = exports.DASHBOARD_READ_ROLES = exports.OPERATOR_ROLES = exports.MANAGEMENT_ROLES = exports.STAFF_ROLES = exports.SUPER_ADMIN_ONLY_ROLES = exports.ADMIN_ROLES = exports.PERMISSION = void 0;
exports.isRole = isRole;
exports.getRolePermissions = getRolePermissions;
exports.hasAllPermissions = hasAllPermissions;
exports.hasAnyPermission = hasAnyPermission;
exports.resolveRoutePermissionPolicy = resolveRoutePermissionPolicy;
exports.canRoleAccessPathname = canRoleAccessPathname;
const shared_types_1 = require("@tbms/shared-types");
exports.PERMISSION = {
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
    'fabrics.read': 'fabrics.read',
    'fabrics.manage': 'fabrics.manage',
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
    'audit.read': 'audit.read',
    'mail.manage': 'mail.manage',
    'system.manage': 'system.manage',
    'search.global': 'search.global',
};
exports.ADMIN_ROLES = [shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN];
exports.SUPER_ADMIN_ONLY_ROLES = [shared_types_1.Role.SUPER_ADMIN];
exports.STAFF_ROLES = [
    shared_types_1.Role.SUPER_ADMIN,
    shared_types_1.Role.ADMIN,
    shared_types_1.Role.ENTRY_OPERATOR,
    shared_types_1.Role.EMPLOYEE,
];
exports.MANAGEMENT_ROLES = [shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.ADMIN];
exports.OPERATOR_ROLES = [shared_types_1.Role.ENTRY_OPERATOR, ...exports.ADMIN_ROLES];
exports.DASHBOARD_READ_ROLES = [shared_types_1.Role.VIEWER, ...exports.OPERATOR_ROLES];
exports.EMPLOYEE_SELF_ROLES = [shared_types_1.Role.EMPLOYEE];
exports.EMPLOYEE_AND_OPERATOR_ROLES = [
    shared_types_1.Role.EMPLOYEE,
    ...exports.OPERATOR_ROLES,
];
exports.ALL_ROLES = [...exports.DASHBOARD_READ_ROLES, ...exports.EMPLOYEE_SELF_ROLES];
const rolePermissionMatrix = {
    [shared_types_1.Role.SUPER_ADMIN]: [],
    [shared_types_1.Role.ADMIN]: [
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
        'fabrics.read',
        'fabrics.manage',
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
        'audit.read',
        'system.manage',
        'search.global',
    ],
    [shared_types_1.Role.ENTRY_OPERATOR]: [
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
        'fabrics.read',
        'garments.read',
        'measurements.read',
        'branches.read',
        'search.global',
    ],
    [shared_types_1.Role.VIEWER]: [
        'dashboard.read',
        'orders.read',
        'orders.receipt',
        'reports.read',
        'tasks.read',
    ],
    [shared_types_1.Role.EMPLOYEE]: [
        'orders.read',
        'employees.self.read',
        'tasks.read',
        'tasks.update',
    ],
};
exports.ROLE_PERMISSIONS = rolePermissionMatrix;
exports.DEFAULT_HOME_BY_ROLE = {
    [shared_types_1.Role.SUPER_ADMIN]: '/',
    [shared_types_1.Role.ADMIN]: '/',
    [shared_types_1.Role.ENTRY_OPERATOR]: '/orders',
    [shared_types_1.Role.VIEWER]: '/',
    [shared_types_1.Role.EMPLOYEE]: '/my-orders',
};
exports.ROUTE_PERMISSION_POLICIES = [
    { pathnamePrefix: '/settings/users', requireAll: ['settings.read', 'users.manage'] },
    { pathnamePrefix: '/settings/system', requireAll: ['settings.read', 'system.manage'] },
    { pathnamePrefix: '/settings/integrations', requireAll: ['settings.read', 'mail.manage'] },
    { pathnamePrefix: '/settings/audit-logs', requireAll: ['settings.read', 'audit.read'] },
    { pathnamePrefix: '/settings/branches', requireAll: ['settings.read', 'branches.read'] },
    { pathnamePrefix: '/settings/garments', requireAll: ['settings.read', 'garments.read'] },
    { pathnamePrefix: '/settings/measurements', requireAll: ['settings.read', 'measurements.read'] },
    { pathnamePrefix: '/settings/rates', requireAll: ['settings.read', 'rates.read'] },
    { pathnamePrefix: '/settings/fabrics', requireAll: ['settings.read', 'fabrics.read'] },
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
exports.FRONTEND_ROUTE_PERMISSIONS = {
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
exports.APP_PROTECTED_PREFIXES = exports.ROUTE_PERMISSION_POLICIES.map((policy) => policy.pathnamePrefix);
exports.EMPLOYEE_ALLOWED_PREFIXES = [
    '/my-orders',
    '/profile',
    '/unauthorized',
];
exports.ADMIN_ONLY_PREFIXES = ['/settings/users', '/settings/system', '/settings/integrations'];
exports.ENTRY_OPERATOR_BLOCKED_PREFIXES = [
    '/settings/users',
    '/settings/system',
    '/settings/integrations',
    '/settings/audit-logs',
];
function isRole(value) {
    return typeof value === 'string' && exports.ALL_ROLES.some((role) => role === value);
}
function getRolePermissions(role) {
    if (role === shared_types_1.Role.SUPER_ADMIN) {
        return [...PERMISSION_UNIVERSE];
    }
    return [...exports.ROLE_PERMISSIONS[role]];
}
function hasAllPermissions(role, required = []) {
    if (required.length === 0) {
        return true;
    }
    const rolePermissions = new Set(getRolePermissions(role));
    return required.every((permission) => rolePermissions.has(permission));
}
function hasAnyPermission(role, required = []) {
    if (required.length === 0) {
        return true;
    }
    const rolePermissions = new Set(getRolePermissions(role));
    return required.some((permission) => rolePermissions.has(permission));
}
function resolveRoutePermissionPolicy(pathname) {
    const normalized = pathname.trim() || '/';
    const sorted = [...exports.ROUTE_PERMISSION_POLICIES].sort((a, b) => b.pathnamePrefix.length - a.pathnamePrefix.length);
    return sorted.find((policy) => {
        if (policy.pathnamePrefix === '/') {
            return normalized === '/';
        }
        return (normalized === policy.pathnamePrefix ||
            normalized.startsWith(`${policy.pathnamePrefix}/`));
    });
}
function canRoleAccessPathname(role, pathname) {
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
const PERMISSION_UNIVERSE = shared_types_1.PERMISSIONS;
exports.FRONTEND_ROUTE_ROLES = {
    '/': [...exports.DASHBOARD_READ_ROLES],
    '/my-orders': [...exports.EMPLOYEE_SELF_ROLES],
    '/orders': [...exports.DASHBOARD_READ_ROLES],
    '/customers': [...exports.OPERATOR_ROLES],
    '/employees': [...exports.OPERATOR_ROLES],
    '/payments': [...exports.ADMIN_ROLES],
    '/expenses': [...exports.ADMIN_ROLES],
    '/reports': [...exports.DASHBOARD_READ_ROLES],
    '/settings': [...exports.ADMIN_ROLES],
};
//# sourceMappingURL=authz.js.map