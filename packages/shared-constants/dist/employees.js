"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYEE_STATUS_BADGE = exports.PAYMENT_TYPE_OPTIONS = exports.PAYMENT_TYPE_LABELS = exports.EMPLOYEE_STATUS_OPTIONS = exports.EMPLOYEE_STATUS_LABELS = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.EMPLOYEE_STATUS_LABELS = {
    [shared_types_1.EmployeeStatus.ACTIVE]: 'Active',
    [shared_types_1.EmployeeStatus.INACTIVE]: 'Inactive',
    [shared_types_1.EmployeeStatus.LEFT]: 'Left',
};
exports.EMPLOYEE_STATUS_OPTIONS = Object.values(shared_types_1.EmployeeStatus).map((value) => ({
    value,
    label: exports.EMPLOYEE_STATUS_LABELS[value],
}));
exports.PAYMENT_TYPE_LABELS = {
    [shared_types_1.PaymentType.PER_PIECE]: 'Per Piece (Commission)',
    [shared_types_1.PaymentType.MONTHLY_FIXED]: 'Monthly Fixed Salary',
};
exports.PAYMENT_TYPE_OPTIONS = Object.values(shared_types_1.PaymentType).map((value) => ({
    value,
    label: exports.PAYMENT_TYPE_LABELS[value],
}));
exports.EMPLOYEE_STATUS_BADGE = {
    [shared_types_1.EmployeeStatus.ACTIVE]: 'success',
    [shared_types_1.EmployeeStatus.INACTIVE]: 'outline',
    [shared_types_1.EmployeeStatus.LEFT]: 'destructive',
};
//# sourceMappingURL=employees.js.map