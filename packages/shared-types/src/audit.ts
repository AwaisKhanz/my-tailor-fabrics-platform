import { Role } from './common';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  actorEmail?: string | null;
  action: string;
  entity: string;
  entityId: string;
  branchId?: string | null;
  oldValue?: JsonValue | null;
  newValue?: JsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface AuditLogsQueryInput {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  branchId?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface AuditLogsListResult {
  data: AuditLogEntry[];
  total: number;
}

export interface AuditLogsStats {
  total: number;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  loginCount: number;
  uniqueUsers: number;
}
