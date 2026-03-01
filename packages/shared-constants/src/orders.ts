import { OrderStatus, ItemStatus, BadgeVariant } from '@tbms/shared-types';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  [OrderStatus.NEW]: { label: "NEW", variant: "outline" },
  [OrderStatus.IN_PROGRESS]: { label: "IN PROGRESS", variant: "warning" },
  [OrderStatus.READY]: { label: "READY", variant: "ready" },
  [OrderStatus.OVERDUE]: { label: "OVERDUE", variant: "destructive" },
  [OrderStatus.DELIVERED]: { label: "DELIVERED", variant: "info" },
  [OrderStatus.COMPLETED]: { label: "COMPLETED", variant: "success" },
  [OrderStatus.CANCELLED]: { label: "CANCELLED", variant: "outline" },
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: 'Pending',
  [ItemStatus.IN_PROGRESS]: 'In Progress',
  [ItemStatus.COMPLETED]: 'Completed',
  [ItemStatus.CANCELLED]: 'Cancelled',
};
