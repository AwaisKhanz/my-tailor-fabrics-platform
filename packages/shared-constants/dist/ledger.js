"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDGER_ENTRY_TYPE_SIGN = exports.LEDGER_ENTRY_TYPE_BADGE = exports.LEDGER_ENTRY_TYPE_OPTIONS = exports.LEDGER_ENTRY_TYPE_LABELS = void 0;
const shared_types_1 = require("@tbms/shared-types");
/** Human-readable labels for each ledger entry type. */
exports.LEDGER_ENTRY_TYPE_LABELS = {
    [shared_types_1.LedgerEntryType.EARNING]: 'Earning',
    [shared_types_1.LedgerEntryType.PAYOUT]: 'Payout',
    [shared_types_1.LedgerEntryType.ADVANCE]: 'Advance',
    [shared_types_1.LedgerEntryType.DEDUCTION]: 'Deduction',
    [shared_types_1.LedgerEntryType.ADJUSTMENT]: 'Adjustment',
    [shared_types_1.LedgerEntryType.SALARY]: 'Salary',
};
exports.LEDGER_ENTRY_TYPE_OPTIONS = Object.values(shared_types_1.LedgerEntryType).map((value) => ({
    value,
    label: exports.LEDGER_ENTRY_TYPE_LABELS[value],
}));
/** Badge variant for each entry type. */
exports.LEDGER_ENTRY_TYPE_BADGE = {
    [shared_types_1.LedgerEntryType.EARNING]: 'default',
    [shared_types_1.LedgerEntryType.PAYOUT]: 'secondary',
    [shared_types_1.LedgerEntryType.ADVANCE]: 'secondary',
    [shared_types_1.LedgerEntryType.DEDUCTION]: 'destructive',
    [shared_types_1.LedgerEntryType.ADJUSTMENT]: 'secondary',
    [shared_types_1.LedgerEntryType.SALARY]: 'default',
};
/**
 * Sign of each entry type (positive = money in, negative = money out).
 * Use this to display +/- prefix in the UI.
 */
exports.LEDGER_ENTRY_TYPE_SIGN = {
    [shared_types_1.LedgerEntryType.EARNING]: 1,
    [shared_types_1.LedgerEntryType.PAYOUT]: -1,
    [shared_types_1.LedgerEntryType.ADVANCE]: -1,
    [shared_types_1.LedgerEntryType.DEDUCTION]: -1,
    [shared_types_1.LedgerEntryType.ADJUSTMENT]: 1,
    [shared_types_1.LedgerEntryType.SALARY]: 1,
};
//# sourceMappingURL=ledger.js.map