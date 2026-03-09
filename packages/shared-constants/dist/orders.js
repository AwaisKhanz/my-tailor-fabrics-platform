"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDON_TYPE_OPTIONS = exports.ADDON_TYPE_LABELS = exports.TASK_STATUS_CONFIG = exports.TASK_STATUS_OPTIONS = exports.TASK_STATUS_LABELS = exports.ITEM_STATUS_CONFIG = exports.ITEM_STATUS_LABELS = exports.OPEN_ORDER_STATUSES = exports.ORDER_STATUS_CONFIG = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.ORDER_STATUS_CONFIG = {
    [shared_types_1.OrderStatus.NEW]: {
        label: "NEW",
        publicLabel: "New",
        variant: "outline",
    },
    [shared_types_1.OrderStatus.IN_PROGRESS]: {
        label: "IN PROGRESS",
        publicLabel: "In Progress",
        variant: "warning",
    },
    [shared_types_1.OrderStatus.READY]: {
        label: "READY",
        publicLabel: "Ready for Pickup",
        variant: "success",
    },
    [shared_types_1.OrderStatus.OVERDUE]: {
        label: "OVERDUE",
        publicLabel: "Overdue",
        variant: "destructive",
    },
    [shared_types_1.OrderStatus.DELIVERED]: {
        label: "DELIVERED",
        publicLabel: "Delivered",
        variant: "info",
    },
    [shared_types_1.OrderStatus.COMPLETED]: {
        label: "COMPLETED",
        publicLabel: "Completed",
        variant: "success",
    },
    [shared_types_1.OrderStatus.CANCELLED]: {
        label: "CANCELLED",
        publicLabel: "Cancelled",
        variant: "outline",
    },
};
// Statuses that represent active work still in the production/delivery pipeline.
exports.OPEN_ORDER_STATUSES = [
    shared_types_1.OrderStatus.NEW,
    shared_types_1.OrderStatus.IN_PROGRESS,
    shared_types_1.OrderStatus.READY,
    shared_types_1.OrderStatus.OVERDUE,
];
exports.ITEM_STATUS_LABELS = {
    [shared_types_1.ItemStatus.PENDING]: 'Pending',
    [shared_types_1.ItemStatus.IN_PROGRESS]: 'In Progress',
    [shared_types_1.ItemStatus.COMPLETED]: 'Completed',
    [shared_types_1.ItemStatus.CANCELLED]: 'Cancelled',
};
exports.ITEM_STATUS_CONFIG = {
    [shared_types_1.ItemStatus.PENDING]: {
        label: exports.ITEM_STATUS_LABELS[shared_types_1.ItemStatus.PENDING],
        variant: 'outline',
    },
    [shared_types_1.ItemStatus.IN_PROGRESS]: {
        label: exports.ITEM_STATUS_LABELS[shared_types_1.ItemStatus.IN_PROGRESS],
        variant: 'info',
    },
    [shared_types_1.ItemStatus.COMPLETED]: {
        label: exports.ITEM_STATUS_LABELS[shared_types_1.ItemStatus.COMPLETED],
        variant: 'success',
    },
    [shared_types_1.ItemStatus.CANCELLED]: {
        label: exports.ITEM_STATUS_LABELS[shared_types_1.ItemStatus.CANCELLED],
        variant: 'destructive',
    },
};
exports.TASK_STATUS_LABELS = {
    [shared_types_1.TaskStatus.PENDING]: 'Pending',
    [shared_types_1.TaskStatus.IN_PROGRESS]: 'In Progress',
    [shared_types_1.TaskStatus.DONE]: 'Done',
    [shared_types_1.TaskStatus.CANCELLED]: 'Cancelled',
};
exports.TASK_STATUS_OPTIONS = Object.values(shared_types_1.TaskStatus).map((status) => ({
    value: status,
    label: exports.TASK_STATUS_LABELS[status],
}));
exports.TASK_STATUS_CONFIG = {
    [shared_types_1.TaskStatus.PENDING]: {
        label: exports.TASK_STATUS_LABELS[shared_types_1.TaskStatus.PENDING],
        variant: 'outline',
    },
    [shared_types_1.TaskStatus.IN_PROGRESS]: {
        label: exports.TASK_STATUS_LABELS[shared_types_1.TaskStatus.IN_PROGRESS],
        variant: 'default',
    },
    [shared_types_1.TaskStatus.DONE]: {
        label: exports.TASK_STATUS_LABELS[shared_types_1.TaskStatus.DONE],
        variant: 'success',
    },
    [shared_types_1.TaskStatus.CANCELLED]: {
        label: exports.TASK_STATUS_LABELS[shared_types_1.TaskStatus.CANCELLED],
        variant: 'destructive',
    },
};
exports.ADDON_TYPE_LABELS = {
    [shared_types_1.AddonType.EXTRA]: 'Extra Charge',
    [shared_types_1.AddonType.ALTERATION]: 'Alteration',
    [shared_types_1.AddonType.DESIGN_CHARGE]: 'Design Charge',
};
exports.ADDON_TYPE_OPTIONS = Object.values(shared_types_1.AddonType).map((type) => ({
    type,
    label: exports.ADDON_TYPE_LABELS[type],
}));
//# sourceMappingURL=orders.js.map