import { OrderStatus, ItemStatus, TaskStatus, BadgeVariant, AddonType } from '@tbms/shared-types';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; publicLabel: string; variant: BadgeVariant }
> = {
  [OrderStatus.NEW]: {
    label: "NEW",
    publicLabel: "New",
    variant: "outline",
  },
  [OrderStatus.IN_PROGRESS]: {
    label: "IN PROGRESS",
    publicLabel: "In Progress",
    variant: "warning",
  },
  [OrderStatus.READY]: {
    label: "READY",
    publicLabel: "Ready for Pickup",
    variant: "success",
  },
  [OrderStatus.OVERDUE]: {
    label: "OVERDUE",
    publicLabel: "Overdue",
    variant: "destructive",
  },
  [OrderStatus.DELIVERED]: {
    label: "DELIVERED",
    publicLabel: "Delivered",
    variant: "info",
  },
  [OrderStatus.COMPLETED]: {
    label: "COMPLETED",
    publicLabel: "Completed",
    variant: "success",
  },
  [OrderStatus.CANCELLED]: {
    label: "CANCELLED",
    publicLabel: "Cancelled",
    variant: "outline",
  },
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

export const ITEM_STATUS_CONFIG: Record<
  ItemStatus,
  { label: string; variant: BadgeVariant }
> = {
  [ItemStatus.PENDING]: {
    label: ITEM_STATUS_LABELS[ItemStatus.PENDING],
    variant: 'outline',
  },
  [ItemStatus.IN_PROGRESS]: {
    label: ITEM_STATUS_LABELS[ItemStatus.IN_PROGRESS],
    variant: 'info',
  },
  [ItemStatus.COMPLETED]: {
    label: ITEM_STATUS_LABELS[ItemStatus.COMPLETED],
    variant: 'success',
  },
  [ItemStatus.CANCELLED]: {
    label: ITEM_STATUS_LABELS[ItemStatus.CANCELLED],
    variant: 'destructive',
  },
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pending',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; variant: BadgeVariant }
> = {
  [TaskStatus.PENDING]: {
    label: TASK_STATUS_LABELS[TaskStatus.PENDING],
    variant: 'outline',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: TASK_STATUS_LABELS[TaskStatus.IN_PROGRESS],
    variant: 'default',
  },
  [TaskStatus.DONE]: {
    label: TASK_STATUS_LABELS[TaskStatus.DONE],
    variant: 'success',
  },
  [TaskStatus.CANCELLED]: {
    label: TASK_STATUS_LABELS[TaskStatus.CANCELLED],
    variant: 'destructive',
  },
};

export const ADDON_TYPE_LABELS: Record<AddonType, string> = {
  [AddonType.EXTRA]: 'Extra Charge',
  [AddonType.ALTERATION]: 'Alteration',
  [AddonType.DESIGN_CHARGE]: 'Design Charge',
};
