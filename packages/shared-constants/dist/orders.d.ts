import { OrderStatus, ItemStatus, TaskStatus, BadgeVariant, AddonType } from '@tbms/shared-types';
export declare const ORDER_STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    variant: BadgeVariant;
}>;
export declare const OPEN_ORDER_STATUSES: readonly [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.OVERDUE];
export declare const ITEM_STATUS_LABELS: Record<ItemStatus, string>;
export declare const TASK_STATUS_LABELS: Record<TaskStatus, string>;
export declare const TASK_STATUS_CONFIG: Record<TaskStatus, {
    label: string;
    variant: BadgeVariant;
}>;
export declare const ADDON_TYPE_LABELS: Record<AddonType, string>;
