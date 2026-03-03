import { OrderStatus, ItemStatus, TaskStatus, BadgeVariant, AddonType } from '@tbms/shared-types';

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

// Statuses that represent active work still in the production/delivery pipeline.
export const OPEN_ORDER_STATUSES = [
  OrderStatus.NEW,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.OVERDUE,
] as const;

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: 'Pending',
  [ItemStatus.IN_PROGRESS]: 'In Progress',
  [ItemStatus.COMPLETED]: 'Completed',
  [ItemStatus.CANCELLED]: 'Cancelled',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

export const ADDON_TYPE_LABELS: Record<AddonType, string> = {
  [AddonType.EXTRA]: 'Extra Charge',
  [AddonType.ALTERATION]: 'Alteration',
  [AddonType.DESIGN_CHARGE]: 'Design Charge',
};
