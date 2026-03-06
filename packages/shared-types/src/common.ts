// API response wrappers
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

// --- Prisma Enums (Synced) ---

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ENTRY_OPERATOR = 'ENTRY_OPERATOR',
  VIEWER = 'VIEWER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LEFT = 'LEFT'
}

export enum PaymentType {
  PER_PIECE = 'PER_PIECE',
  MONTHLY_FIXED = 'MONTHLY_FIXED'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED'
}

export enum FieldType {
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
  DROPDOWN = 'DROPDOWN'
}

export enum OrderStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  OVERDUE = 'OVERDUE',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export enum FabricSource {
  SHOP = 'SHOP',
  CUSTOMER = 'CUSTOMER'
}

export enum LedgerEntryType {
  EARNING = 'EARNING',
  PAYOUT = 'PAYOUT',
  ADVANCE = 'ADVANCE',
  DEDUCTION = 'DEDUCTION',
  ADJUSTMENT = 'ADJUSTMENT',
  SALARY = 'SALARY'
}

export enum AddonType {
  EXTRA = 'EXTRA',
  ALTERATION = 'ALTERATION',
  DESIGN_CHARGE = 'DESIGN_CHARGE'
}

// UI Type Definitions
export type BadgeVariant = 
  | 'default' 
  | 'secondary'
  | 'outline' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'destructive';
