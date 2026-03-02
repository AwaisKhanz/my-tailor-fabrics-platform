import { DiscountType, FabricSource } from '@tbms/shared-types';
export declare class OrderItemDto {
    garmentTypeId: string;
    quantity: number;
    description?: string;
    fabricSource?: FabricSource;
    employeeId?: string;
    dueDate?: string;
    designTypeId?: string;
    addons?: OrderItemAddonDto[];
    unitPrice?: number;
    employeeRate?: number;
}
export declare class OrderItemAddonDto {
    type: string;
    name: string;
    price: number;
    cost?: number;
}
export declare class CreateOrderDto {
    customerId: string;
    dueDate: string;
    items: OrderItemDto[];
    discountType?: DiscountType;
    discountValue?: number;
    notes?: string;
    advancePayment?: number;
}
