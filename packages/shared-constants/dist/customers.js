"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUSTOMER_STATUS_BADGE = exports.CUSTOMER_STATUS_LABELS = void 0;
const shared_types_1 = require("@tbms/shared-types");
exports.CUSTOMER_STATUS_LABELS = {
    [shared_types_1.CustomerStatus.ACTIVE]: 'Active',
    [shared_types_1.CustomerStatus.INACTIVE]: 'Inactive',
    [shared_types_1.CustomerStatus.BLACKLISTED]: 'Blacklisted',
};
exports.CUSTOMER_STATUS_BADGE = {
    [shared_types_1.CustomerStatus.ACTIVE]: 'success',
    [shared_types_1.CustomerStatus.INACTIVE]: 'outline',
    [shared_types_1.CustomerStatus.BLACKLISTED]: 'destructive',
};
//# sourceMappingURL=customers.js.map