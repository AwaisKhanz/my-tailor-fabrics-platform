"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonType = exports.LedgerEntryType = exports.FabricSource = exports.DiscountType = exports.TaskStatus = exports.ItemStatus = exports.OrderStatus = exports.FieldType = exports.CustomerStatus = exports.PaymentType = exports.EmployeeStatus = exports.Role = void 0;
exports.isOrderStatus = isOrderStatus;
exports.isTaskStatus = isTaskStatus;
exports.isLedgerEntryType = isLedgerEntryType;
exports.isAddonType = isAddonType;
// --- Prisma Enums (Synced) ---
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["ADMIN"] = "ADMIN";
    Role["ENTRY_OPERATOR"] = "ENTRY_OPERATOR";
    Role["VIEWER"] = "VIEWER";
    Role["EMPLOYEE"] = "EMPLOYEE";
})(Role || (exports.Role = Role = {}));
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "ACTIVE";
    EmployeeStatus["INACTIVE"] = "INACTIVE";
    EmployeeStatus["LEFT"] = "LEFT";
})(EmployeeStatus || (exports.EmployeeStatus = EmployeeStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["PER_PIECE"] = "PER_PIECE";
    PaymentType["MONTHLY_FIXED"] = "MONTHLY_FIXED";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["BLACKLISTED"] = "BLACKLISTED";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var FieldType;
(function (FieldType) {
    FieldType["NUMBER"] = "NUMBER";
    FieldType["TEXT"] = "TEXT";
    FieldType["DROPDOWN"] = "DROPDOWN";
})(FieldType || (exports.FieldType = FieldType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "NEW";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["READY"] = "READY";
    OrderStatus["OVERDUE"] = "OVERDUE";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
function isOrderStatus(value) {
    switch (value) {
        case OrderStatus.NEW:
        case OrderStatus.IN_PROGRESS:
        case OrderStatus.READY:
        case OrderStatus.OVERDUE:
        case OrderStatus.DELIVERED:
        case OrderStatus.COMPLETED:
        case OrderStatus.CANCELLED:
            return true;
        default:
            return false;
    }
}
var ItemStatus;
(function (ItemStatus) {
    ItemStatus["PENDING"] = "PENDING";
    ItemStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ItemStatus["COMPLETED"] = "COMPLETED";
    ItemStatus["CANCELLED"] = "CANCELLED";
})(ItemStatus || (exports.ItemStatus = ItemStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["DONE"] = "DONE";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
function isTaskStatus(value) {
    switch (value) {
        case TaskStatus.PENDING:
        case TaskStatus.IN_PROGRESS:
        case TaskStatus.DONE:
        case TaskStatus.CANCELLED:
            return true;
        default:
            return false;
    }
}
var DiscountType;
(function (DiscountType) {
    DiscountType["FIXED"] = "FIXED";
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var FabricSource;
(function (FabricSource) {
    FabricSource["SHOP"] = "SHOP";
    FabricSource["CUSTOMER"] = "CUSTOMER";
})(FabricSource || (exports.FabricSource = FabricSource = {}));
var LedgerEntryType;
(function (LedgerEntryType) {
    LedgerEntryType["EARNING"] = "EARNING";
    LedgerEntryType["PAYOUT"] = "PAYOUT";
    LedgerEntryType["ADVANCE"] = "ADVANCE";
    LedgerEntryType["DEDUCTION"] = "DEDUCTION";
    LedgerEntryType["ADJUSTMENT"] = "ADJUSTMENT";
    LedgerEntryType["SALARY"] = "SALARY";
})(LedgerEntryType || (exports.LedgerEntryType = LedgerEntryType = {}));
function isLedgerEntryType(value) {
    switch (value) {
        case LedgerEntryType.EARNING:
        case LedgerEntryType.PAYOUT:
        case LedgerEntryType.ADVANCE:
        case LedgerEntryType.DEDUCTION:
        case LedgerEntryType.ADJUSTMENT:
        case LedgerEntryType.SALARY:
            return true;
        default:
            return false;
    }
}
var AddonType;
(function (AddonType) {
    AddonType["EXTRA"] = "EXTRA";
    AddonType["ALTERATION"] = "ALTERATION";
    AddonType["DESIGN_CHARGE"] = "DESIGN_CHARGE";
})(AddonType || (exports.AddonType = AddonType = {}));
function isAddonType(value) {
    switch (value) {
        case AddonType.EXTRA:
        case AddonType.ALTERATION:
        case AddonType.DESIGN_CHARGE:
            return true;
        default:
            return false;
    }
}
