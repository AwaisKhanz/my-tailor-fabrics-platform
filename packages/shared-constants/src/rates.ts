/**
 * Step key constants for production workflow steps.
 * Use these instead of hardcoded strings for type-safe step references.
 */
export const STEP_KEYS = {
  CUTTING: 'CUTTING',
  STITCHING: 'STITCHING',
  DESIGNING: 'DESIGNING',
  FINISHING: 'FINISHING',
  PRESSING: 'PRESSING',
  QUALITY_CHECK: 'QUALITY_CHECK',
} as const;

export type StepKey = (typeof STEP_KEYS)[keyof typeof STEP_KEYS];

/** Human-readable labels for each production step key. */
export const STEP_KEY_LABELS: Record<StepKey, string> = {
  [STEP_KEYS.CUTTING]: 'Cutting',
  [STEP_KEYS.STITCHING]: 'Stitching',
  [STEP_KEYS.DESIGNING]: 'Designing',
  [STEP_KEYS.FINISHING]: 'Finishing & Kajj/Button',
  [STEP_KEYS.PRESSING]: 'Pressing & Packing',
  [STEP_KEYS.QUALITY_CHECK]: 'Quality Check',
};

/**
 * Converts a paisa (integer) amount to rupees with 2 decimal places string.
 * Always use paisa (Int) for storage. Display using this helper.
 */
export function paisaToRupees(paisa: number): string {
  return (paisa / 100).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Converts a rupees (float) input from UI to paisa for storage.
 * Rounds to nearest paisa to avoid floating-point errors.
 */
export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Returns the effective rate for a task:
 * rateOverride takes priority over rateSnapshot.
 */
export function getEffectiveTaskRate(rateSnapshot?: number | null, rateOverride?: number | null): number {
  return rateOverride ?? rateSnapshot ?? 0;
}
