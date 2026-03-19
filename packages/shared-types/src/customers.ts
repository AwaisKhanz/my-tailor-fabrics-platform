import { CustomerStatus, PaginatedResponse } from './common';
import type { FieldType } from './common';

export type MeasurementValue = string | number | boolean | null;
export type MeasurementValues = Record<string, MeasurementValue>;

export interface MeasurementValueSnapshotMeta {
  fieldId: string;
  label: string;
  fieldType: FieldType;
  unit?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  isRequired: boolean;
}

export type MeasurementValuesMeta = Record<string, MeasurementValueSnapshotMeta>;

export interface Customer {
  id: string;
  branchId: string;
  sizeNumber: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  status: CustomerStatus;
  isVip: boolean;
  lifetimeValue: number; // paisas: booked value across non-cancelled orders
  createdAt: string;
  updatedAt: string;
  measurements?: CustomerMeasurement[];
  stats?: {
    totalOrders: number;
    totalSpent: number;
    totalPaid: number;
  };
}

export interface CustomerMeasurement {
  id: string;
  customerId: string;
  categoryId: string;
  values: MeasurementValues;
  valuesMeta?: MeasurementValuesMeta | null;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    fields: import('./config').MeasurementField[];
  };
}

export interface CustomerDetail extends Customer {
  measurements: CustomerMeasurement[];
}

export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  status?: CustomerStatus;
}

export interface ToggleCustomerVipInput {
  isVip: boolean;
}

export interface UpsertCustomerMeasurementInput {
  categoryId: string;
  values: MeasurementValues;
}

export interface CustomersListSummary {
  totalCustomers: number;
  whatsappConnectedCount: number;
  vipCustomersCount: number;
}

export interface CustomersListQueryInput {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  isVip?: boolean;
}

export interface CustomersSummaryQueryInput {
  search?: string;
  status?: CustomerStatus;
  isVip?: boolean;
}

export interface CustomerOrdersQueryInput {
  page?: number;
  limit?: number;
}

export type CustomersListResult = PaginatedResponse<Customer>;

export type CustomerOrdersResult = PaginatedResponse<import('./orders').Order>;
