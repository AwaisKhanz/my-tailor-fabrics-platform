"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_BADGE = exports.ROLE_LABELS = exports.ROLES = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.ROLES = [
    { value: shared_types_1.Role.SUPER_ADMIN, label: 'Super Admin' },
    { value: shared_types_1.Role.ADMIN, label: 'Admin' },
    { value: shared_types_1.Role.ENTRY_OPERATOR, label: 'Entry Operator' },
    { value: shared_types_1.Role.VIEWER, label: 'Viewer' },
    { value: shared_types_1.Role.EMPLOYEE, label: 'Employee' },
];
exports.ROLE_LABELS = Object.fromEntries(exports.ROLES.map((role) => [role.value, role.label]));
exports.ROLE_BADGE = {
    [shared_types_1.Role.SUPER_ADMIN]: 'default',
    [shared_types_1.Role.ADMIN]: 'secondary',
    [shared_types_1.Role.ENTRY_OPERATOR]: 'warning',
    [shared_types_1.Role.VIEWER]: 'outline',
    [shared_types_1.Role.EMPLOYEE]: 'success',
};
//# sourceMappingURL=roles.js.map