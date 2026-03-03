"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COAT_INITIAL_RATES = exports.SHALWAR_KAMEEZ_INITIAL_RATES = exports.RATE_SPLIT_HINTS = exports.COAT_WORKFLOW_STEP_PRESETS = exports.SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS = exports.DEFAULT_WORKFLOW_STEP_PRESETS = exports.STEP_KEY_LABELS = exports.STEP_KEYS = void 0;
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
exports.DEFAULT_WORKFLOW_STEP_PRESETS = [
    {
        stepKey: exports.STEP_KEYS.CUTTING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.CUTTING],
        sortOrder: 1,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.STITCHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.STITCHING],
        sortOrder: 2,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.FINISHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.FINISHING],
        sortOrder: 3,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.PRESSING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.PRESSING],
        sortOrder: 4,
        isRequired: true,
        isActive: true,
    },
];
exports.SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS = [
    {
        stepKey: exports.STEP_KEYS.CUTTING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.CUTTING],
        sortOrder: 10,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.STITCHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.STITCHING],
        sortOrder: 20,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.DESIGNING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.DESIGNING],
        sortOrder: 25,
        isRequired: false,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.FINISHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.FINISHING],
        sortOrder: 30,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.PRESSING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.PRESSING],
        sortOrder: 40,
        isRequired: true,
        isActive: true,
    },
];
exports.COAT_WORKFLOW_STEP_PRESETS = [
    {
        stepKey: exports.STEP_KEYS.CUTTING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.CUTTING],
        sortOrder: 10,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.STITCHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.STITCHING],
        sortOrder: 20,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.FINISHING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.FINISHING],
        sortOrder: 30,
        isRequired: true,
        isActive: true,
    },
    {
        stepKey: exports.STEP_KEYS.PRESSING,
        stepName: exports.STEP_KEY_LABELS[exports.STEP_KEYS.PRESSING],
        sortOrder: 40,
        isRequired: true,
        isActive: true,
    },
];
exports.RATE_SPLIT_HINTS = {
    [exports.STEP_KEYS.CUTTING]: 0.2,
    [exports.STEP_KEYS.STITCHING]: 0.6,
    [exports.STEP_KEYS.PRESSING]: 0.1,
};
exports.SHALWAR_KAMEEZ_INITIAL_RATES = {
    [exports.STEP_KEYS.CUTTING]: 10000,
    [exports.STEP_KEYS.STITCHING]: 25000,
    [exports.STEP_KEYS.DESIGNING]: 5000,
    [exports.STEP_KEYS.FINISHING]: 5000,
    [exports.STEP_KEYS.PRESSING]: 5000,
};
exports.COAT_INITIAL_RATES = {
    [exports.STEP_KEYS.CUTTING]: 200000,
    [exports.STEP_KEYS.STITCHING]: 400000,
    [exports.STEP_KEYS.FINISHING]: 100000,
    [exports.STEP_KEYS.PRESSING]: 100000,
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