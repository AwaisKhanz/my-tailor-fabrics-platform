import { DiscountType } from '@tbms/shared-types';
export declare class OrderItemDto {
    garmentTypeId: string;
    quantity: number;
    description?: string;
    employeeId?: string;
    dueDate?: string;
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
