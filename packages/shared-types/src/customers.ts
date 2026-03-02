import { CustomerStatus } from './common';

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
  lifetimeValue: number;  // paisas: total paid across all orders
  createdAt: string;
  updatedAt: string;
  measurements?: CustomerMeasurement[];
  stats?: {
    totalOrders: number;
    totalSpent: number;
  };
}

export interface CustomerMeasurement {
  id: string;
  customerId: string;
  categoryId: string;
  values: Record<string, unknown>;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    fields: import('./config').MeasurementField[];
  };
}
