"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_STATUS_LABELS = exports.ORDER_STATUS_CONFIG = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.ORDER_STATUS_CONFIG = {
    [shared_types_1.OrderStatus.NEW]: { label: "NEW", variant: "outline" },
    [shared_types_1.OrderStatus.IN_PROGRESS]: { label: "IN PROGRESS", variant: "warning" },
    [shared_types_1.OrderStatus.READY]: { label: "READY", variant: "ready" },
    [shared_types_1.OrderStatus.OVERDUE]: { label: "OVERDUE", variant: "destructive" },
    [shared_types_1.OrderStatus.DELIVERED]: { label: "DELIVERED", variant: "info" },
    [shared_types_1.OrderStatus.COMPLETED]: { label: "COMPLETED", variant: "success" },
    [shared_types_1.OrderStatus.CANCELLED]: { label: "CANCELLED", variant: "outline" },
};
exports.ITEM_STATUS_LABELS = {
    [shared_types_1.ItemStatus.PENDING]: 'Pending',
    [shared_types_1.ItemStatus.IN_PROGRESS]: 'In Progress',
    [shared_types_1.ItemStatus.COMPLETED]: 'Completed',
    [shared_types_1.ItemStatus.CANCELLED]: 'Cancelled',
};
//# sourceMappingURL=orders.js.map