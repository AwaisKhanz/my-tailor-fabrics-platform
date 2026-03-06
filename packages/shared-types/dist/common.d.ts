export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}
export interface PaginationMeta {
    page: number;
    lastPage: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    meta: PaginationMeta;
}
export declare enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    ENTRY_OPERATOR = "ENTRY_OPERATOR",
    VIEWER = "VIEWER",
    EMPLOYEE = "EMPLOYEE"
}
export declare enum EmployeeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    LEFT = "LEFT"
}
export declare enum PaymentType {
    PER_PIECE = "PER_PIECE",
    MONTHLY_FIXED = "MONTHLY_FIXED"
}
export declare enum CustomerStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLACKLISTED = "BLACKLISTED"
}
export declare enum FieldType {
    NUMBER = "NUMBER",
    TEXT = "TEXT",
    DROPDOWN = "DROPDOWN"
}
export declare enum OrderStatus {
    NEW = "NEW",
    IN_PROGRESS = "IN_PROGRESS",
    READY = "READY",
    OVERDUE = "OVERDUE",
    DELIVERED = "DELIVERED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum ItemStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE",
    CANCELLED = "CANCELLED"
}
export declare enum DiscountType {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE"
}
export declare enum FabricSource {
    SHOP = "SHOP",
    CUSTOMER = "CUSTOMER"
}
export declare enum LedgerEntryType {
    EARNING = "EARNING",
    PAYOUT = "PAYOUT",
    ADVANCE = "ADVANCE",
    DEDUCTION = "DEDUCTION",
    ADJUSTMENT = "ADJUSTMENT",
    SALARY = "SALARY"
}
export declare enum AddonType {
    EXTRA = "EXTRA",
    ALTERATION = "ALTERATION",
    DESIGN_CHARGE = "DESIGN_CHARGE"
}
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' | 'destructive';
