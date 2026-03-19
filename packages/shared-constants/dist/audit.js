"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_FILTER_ENTITIES = exports.AUDIT_ENTITIES = exports.AUDIT_UNKNOWN_ENTITY = exports.AUDIT_ACTIONS = void 0;
exports.AUDIT_ACTIONS = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGIN_FAILED',
    'LOGOUT',
    'TOKEN_REFRESH',
];
exports.AUDIT_UNKNOWN_ENTITY = 'Unknown';
exports.AUDIT_ENTITIES = [
    'Customer',
    'Employee',
    'Order',
    'OrderItem',
    'Task',
    'Payment',
    'Expense',
    'ExpenseCategory',
    'Branch',
    'User',
    'GarmentType',
    'MeasurementCategory',
    'MeasurementField',
    'MeasurementSection',
    'DesignType',
    'RateCard',
    exports.AUDIT_UNKNOWN_ENTITY,
];
exports.AUDIT_FILTER_ENTITIES = exports.AUDIT_ENTITIES.filter((entity) => entity !== exports.AUDIT_UNKNOWN_ENTITY);
//# sourceMappingURL=audit.js.map