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
export interface WorkflowStepPreset {
    stepKey: StepKey;
    stepName: string;
    sortOrder: number;
    isRequired: boolean;
    isActive: boolean;
}
export declare const DEFAULT_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset>;
export declare const SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset>;
export declare const COAT_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset>;
export declare const RATE_SPLIT_HINTS: Readonly<Partial<Record<StepKey, number>>>;
export declare const SHALWAR_KAMEEZ_INITIAL_RATES: Readonly<Partial<Record<StepKey, number>>>;
export declare const COAT_INITIAL_RATES: Readonly<Partial<Record<StepKey, number>>>;
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
 * rateOverride takes priority over snapshots.
 */
export declare function getEffectiveTaskRate(rateSnapshot?: number | null, rateOverride?: number | null, designRateSnapshot?: number | null): number;
