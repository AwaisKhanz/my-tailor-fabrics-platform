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

export interface WorkflowStepPreset {
  stepKey: StepKey;
  stepName: string;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
}

export const DEFAULT_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset> = [
  {
    stepKey: STEP_KEYS.CUTTING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.CUTTING],
    sortOrder: 1,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.STITCHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.STITCHING],
    sortOrder: 2,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.FINISHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.FINISHING],
    sortOrder: 3,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.PRESSING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.PRESSING],
    sortOrder: 4,
    isRequired: true,
    isActive: true,
  },
];

export const SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset> = [
  {
    stepKey: STEP_KEYS.CUTTING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.CUTTING],
    sortOrder: 10,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.STITCHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.STITCHING],
    sortOrder: 20,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.DESIGNING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.DESIGNING],
    sortOrder: 25,
    isRequired: false,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.FINISHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.FINISHING],
    sortOrder: 30,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.PRESSING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.PRESSING],
    sortOrder: 40,
    isRequired: true,
    isActive: true,
  },
];

export const COAT_WORKFLOW_STEP_PRESETS: ReadonlyArray<WorkflowStepPreset> = [
  {
    stepKey: STEP_KEYS.CUTTING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.CUTTING],
    sortOrder: 10,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.STITCHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.STITCHING],
    sortOrder: 20,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.FINISHING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.FINISHING],
    sortOrder: 30,
    isRequired: true,
    isActive: true,
  },
  {
    stepKey: STEP_KEYS.PRESSING,
    stepName: STEP_KEY_LABELS[STEP_KEYS.PRESSING],
    sortOrder: 40,
    isRequired: true,
    isActive: true,
  },
];

export const RATE_SPLIT_HINTS: Readonly<Partial<Record<StepKey, number>>> = {
  [STEP_KEYS.CUTTING]: 0.2,
  [STEP_KEYS.STITCHING]: 0.6,
  [STEP_KEYS.PRESSING]: 0.1,
};

export const SHALWAR_KAMEEZ_INITIAL_RATES: Readonly<
  Partial<Record<StepKey, number>>
> = {
  [STEP_KEYS.CUTTING]: 10000,
  [STEP_KEYS.STITCHING]: 25000,
  [STEP_KEYS.DESIGNING]: 5000,
  [STEP_KEYS.FINISHING]: 5000,
  [STEP_KEYS.PRESSING]: 5000,
};

export const COAT_INITIAL_RATES: Readonly<Partial<Record<StepKey, number>>> = {
  [STEP_KEYS.CUTTING]: 200000,
  [STEP_KEYS.STITCHING]: 400000,
  [STEP_KEYS.FINISHING]: 100000,
  [STEP_KEYS.PRESSING]: 100000,
};

/**
 * Formats a paisa (integer) amount to a PKR currency string (e.g. Rs. 1,000).
 * Always use paisa (Int) for storage. Display using this helper.
 */
export function formatPKR(paisa: number): string {
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
export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Returns the effective rate for a task:
 * rateOverride takes priority over snapshots.
 */
export function getEffectiveTaskRate(
  rateSnapshot?: number | null,
  rateOverride?: number | null,
  designRateSnapshot?: number | null,
): number {
  return rateOverride ?? designRateSnapshot ?? rateSnapshot ?? 0;
}
