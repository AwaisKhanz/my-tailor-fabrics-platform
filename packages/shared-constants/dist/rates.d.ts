/**
 * Step key constants for production workflow steps.
 * Use these instead of hardcoded strings for type-safe step references.
 */
export declare const STEP_KEYS: {
    readonly CUTTING: "CUTTING";
    readonly STITCHING: "STITCHING";
    readonly DESIGNING: "DESIGNING";
    readonly FINISHING: "FINISHING";
    readonly PRESSING: "PRESSING";
    readonly QUALITY_CHECK: "QUALITY_CHECK";
};
export type StepKey = (typeof STEP_KEYS)[keyof typeof STEP_KEYS];
/** Human-readable labels for each production step key. */
export declare const STEP_KEY_LABELS: Record<StepKey, string>;
/**
 * Formats a paisa (integer) amount to a PKR currency string (e.g. Rs. 1,000).
 * Always use paisa (Int) for storage. Display using this helper.
 */
export declare function formatPKR(paisa: number): string;
/**
 * Converts a rupees (float) input from UI to paisa for storage.
 * Rounds to nearest paisa to avoid floating-point errors.
 */
export declare function rupeesToPaisa(rupees: number): number;
/**
 * Returns the effective rate for a task:
 * rateOverride takes priority over rateSnapshot.
 */
export declare function getEffectiveTaskRate(rateSnapshot?: number | null, rateOverride?: number | null): number;
