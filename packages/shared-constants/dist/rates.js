"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STEP_KEY_LABELS = exports.STEP_KEYS = void 0;
exports.formatPKR = formatPKR;
exports.rupeesToPaisa = rupeesToPaisa;
exports.getEffectiveTaskRate = getEffectiveTaskRate;
/**
 * Step key constants for production workflow steps.
 * Use these instead of hardcoded strings for type-safe step references.
 */
exports.STEP_KEYS = {
    CUTTING: 'CUTTING',
    STITCHING: 'STITCHING',
    DESIGNING: 'DESIGNING',
    FINISHING: 'FINISHING',
    PRESSING: 'PRESSING',
    QUALITY_CHECK: 'QUALITY_CHECK',
};
/** Human-readable labels for each production step key. */
exports.STEP_KEY_LABELS = {
    [exports.STEP_KEYS.CUTTING]: 'Cutting',
    [exports.STEP_KEYS.STITCHING]: 'Stitching',
    [exports.STEP_KEYS.DESIGNING]: 'Designing',
    [exports.STEP_KEYS.FINISHING]: 'Finishing & Kajj/Button',
    [exports.STEP_KEYS.PRESSING]: 'Pressing & Packing',
    [exports.STEP_KEYS.QUALITY_CHECK]: 'Quality Check',
};
/**
 * Formats a paisa (integer) amount to a PKR currency string (e.g. Rs. 1,000).
 * Always use paisa (Int) for storage. Display using this helper.
 */
function formatPKR(paisa) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(paisa / 100);
}
/**
 * Converts a rupees (float) input from UI to paisa for storage.
 * Rounds to nearest paisa to avoid floating-point errors.
 */
function rupeesToPaisa(rupees) {
    return Math.round(rupees * 100);
}
/**
 * Returns the effective rate for a task:
 * rateOverride takes priority over rateSnapshot.
 */
function getEffectiveTaskRate(rateSnapshot, rateOverride, designRate) {
    return rateOverride ?? designRate ?? rateSnapshot ?? 0;
}
//# sourceMappingURL=rates.js.map