"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_BADGE = exports.ROLES = exports.ROLE_LABELS = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.ROLE_LABELS = {
    [shared_types_1.Role.SUPER_ADMIN]: 'Super Admin',
    [shared_types_1.Role.ADMIN]: 'Admin',
    [shared_types_1.Role.ENTRY_OPERATOR]: 'Entry Operator',
    [shared_types_1.Role.VIEWER]: 'Viewer',
    [shared_types_1.Role.EMPLOYEE]: 'Employee',
};
exports.ROLES = [
    { value: shared_types_1.Role.SUPER_ADMIN, label: exports.ROLE_LABELS[shared_types_1.Role.SUPER_ADMIN] },
    { value: shared_types_1.Role.ADMIN, label: exports.ROLE_LABELS[shared_types_1.Role.ADMIN] },
    { value: shared_types_1.Role.ENTRY_OPERATOR, label: exports.ROLE_LABELS[shared_types_1.Role.ENTRY_OPERATOR] },
    { value: shared_types_1.Role.VIEWER, label: exports.ROLE_LABELS[shared_types_1.Role.VIEWER] },
    { value: shared_types_1.Role.EMPLOYEE, label: exports.ROLE_LABELS[shared_types_1.Role.EMPLOYEE] },
];
exports.ROLE_BADGE = {
    [shared_types_1.Role.SUPER_ADMIN]: 'default',
    [shared_types_1.Role.ADMIN]: 'secondary',
    [shared_types_1.Role.ENTRY_OPERATOR]: 'warning',
    [shared_types_1.Role.VIEWER]: 'outline',
    [shared_types_1.Role.EMPLOYEE]: 'success',
};
//# sourceMappingURL=roles.js.map