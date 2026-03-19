import { Role } from './common';
export declare const PERMISSIONS: readonly ["dashboard.read", "orders.read", "orders.create", "orders.update", "orders.financial.manage", "orders.cancel", "orders.share", "orders.receipt", "orderItems.manage", "customers.read", "customers.create", "customers.update", "customers.delete", "customers.measurements.manage", "employees.read", "employees.self.read", "employees.manage", "payments.read", "payments.manage", "expenses.read", "expenses.manage", "reports.read", "reports.export", "settings.read", "settings.manage", "tasks.read", "tasks.assign", "tasks.update", "tasks.rate.override", "rates.read", "rates.manage", "fabrics.read", "fabrics.manage", "designTypes.read", "designTypes.manage", "garments.read", "garments.manage", "measurements.read", "measurements.manage", "ledger.read", "ledger.manage", "branch.switch", "branches.read", "branches.manage", "users.read", "users.manage", "audit.read", "mail.manage", "system.manage", "search.global"];
export type Permission = (typeof PERMISSIONS)[number];
export interface RoutePermissionPolicy {
    pathnamePrefix: string;
    requireAll?: Permission[];
    requireAny?: Permission[];
}
export interface AuthorizationContext {
    role: Role;
    permissions: Permission[];
    branchId?: string | null;
    employeeId?: string | null;
}
