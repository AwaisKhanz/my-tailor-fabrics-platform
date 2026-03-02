"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonType = exports.LedgerEntryType = exports.FabricSource = exports.DiscountType = exports.TaskStatus = exports.ItemStatus = exports.OrderStatus = exports.FieldType = exports.CustomerStatus = exports.PaymentType = exports.EmployeeStatus = exports.Role = void 0;
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
    PaymentType["WEEKLY_FIXED"] = "WEEKLY_FIXED";
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
var AddonType;
(function (AddonType) {
    AddonType["EXTRA"] = "EXTRA";
    AddonType["ALTERATION"] = "ALTERATION";
    AddonType["DESIGN_CHARGE"] = "DESIGN_CHARGE";
})(AddonType || (exports.AddonType = AddonType = {}));
