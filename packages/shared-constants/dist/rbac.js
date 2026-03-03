"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_ROUTE_ROLES = exports.DEFAULT_HOME_BY_ROLE = exports.ALL_ROLES = exports.EMPLOYEE_AND_OPERATOR_ROLES = exports.EMPLOYEE_SELF_ROLES = exports.DASHBOARD_READ_ROLES = exports.OPERATOR_ROLES = exports.SUPER_ADMIN_ONLY_ROLES = exports.ADMIN_ROLES = exports.EMPLOYEE_ALLOWED_PREFIXES = exports.ENTRY_OPERATOR_BLOCKED_PREFIXES = exports.ADMIN_ONLY_PREFIXES = exports.APP_PROTECTED_PREFIXES = void 0;
const shared_types_1 = require("@tbms/shared-types");
// Route prefixes that require authentication in the web app.
exports.APP_PROTECTED_PREFIXES = [
    '/',
    '/orders',
    '/customers',
    '/employees',
    '/payments',
    '/expenses',
    '/reports',
    '/settings',
    '/my-orders',
];
exports.ADMIN_ONLY_PREFIXES = ['/settings', '/employees/new'];
exports.ENTRY_OPERATOR_BLOCKED_PREFIXES = ['/settings'];
exports.EMPLOYEE_ALLOWED_PREFIXES = [
    '/my-orders',
    '/profile',
    '/unauthorized',
];
// Canonical reusable role groups (frontend + backend consumption).
exports.ADMIN_ROLES = [shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN];
exports.SUPER_ADMIN_ONLY_ROLES = [shared_types_1.Role.SUPER_ADMIN];
exports.OPERATOR_ROLES = [shared_types_1.Role.ENTRY_OPERATOR, ...exports.ADMIN_ROLES];
exports.DASHBOARD_READ_ROLES = [shared_types_1.Role.VIEWER, ...exports.OPERATOR_ROLES];
exports.EMPLOYEE_SELF_ROLES = [shared_types_1.Role.EMPLOYEE];
exports.EMPLOYEE_AND_OPERATOR_ROLES = [
    shared_types_1.Role.EMPLOYEE,
    ...exports.OPERATOR_ROLES,
];
exports.ALL_ROLES = [...exports.DASHBOARD_READ_ROLES, ...exports.EMPLOYEE_SELF_ROLES];
exports.DEFAULT_HOME_BY_ROLE = {
    [shared_types_1.Role.SUPER_ADMIN]: '/',
    [shared_types_1.Role.ADMIN]: '/',
    [shared_types_1.Role.ENTRY_OPERATOR]: '/orders',
    [shared_types_1.Role.VIEWER]: '/',
    [shared_types_1.Role.EMPLOYEE]: '/my-orders',
};
exports.FRONTEND_ROUTE_ROLES = {
    '/': [...exports.DASHBOARD_READ_ROLES],
    '/my-orders': [...exports.EMPLOYEE_SELF_ROLES],
    '/orders': [...exports.DASHBOARD_READ_ROLES],
    '/customers': [...exports.DASHBOARD_READ_ROLES],
    '/employees': [...exports.DASHBOARD_READ_ROLES],
    '/payments': [...exports.DASHBOARD_READ_ROLES],
    '/expenses': [...exports.DASHBOARD_READ_ROLES],
    '/reports': [...exports.DASHBOARD_READ_ROLES],
    '/settings': [...exports.ADMIN_ROLES],
};
//# sourceMappingURL=rbac.js.map