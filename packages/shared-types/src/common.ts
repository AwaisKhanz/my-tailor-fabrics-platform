// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
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
  WEEKLY_FIXED = 'WEEKLY_FIXED'
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

export enum DiscountType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

// UI Type Definitions
export type BadgeVariant = 
  | 'default' 
  | 'secondary' 
  | 'destructive' 
  | 'outline' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'ready' 
  | 'admin' 
  | 'royal' 
  | 'amber';
