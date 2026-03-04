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
    lifetimeValue: number;
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
    values: Record<string, unknown>;
}
export interface CustomersListSummary {
    totalCustomers: number;
    whatsappConnectedCount: number;
    vipCustomersCount: number;
}
