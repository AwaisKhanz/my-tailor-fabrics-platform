import { LedgerEntryType, BadgeVariant } from '@tbms/shared-types';

/** Human-readable labels for each ledger entry type. */
export const LEDGER_ENTRY_TYPE_LABELS: Record<LedgerEntryType, string> = {
  [LedgerEntryType.EARNING]: 'Earning',
  [LedgerEntryType.PAYOUT]: 'Payout',
  [LedgerEntryType.ADVANCE]: 'Advance',
  [LedgerEntryType.DEDUCTION]: 'Deduction',
  [LedgerEntryType.ADJUSTMENT]: 'Adjustment',
  [LedgerEntryType.SALARY]: 'Salary',
};

export const LEDGER_ENTRY_TYPE_OPTIONS = Object.values(LedgerEntryType).map(
  (value) => ({
    value,
    label: LEDGER_ENTRY_TYPE_LABELS[value],
  }),
);

/** Badge variant for each entry type. */
export const LEDGER_ENTRY_TYPE_BADGE: Record<LedgerEntryType, BadgeVariant> = {
  [LedgerEntryType.EARNING]: 'default',
  [LedgerEntryType.PAYOUT]: 'secondary',
  [LedgerEntryType.ADVANCE]: 'secondary',
  [LedgerEntryType.DEDUCTION]: 'destructive',
  [LedgerEntryType.ADJUSTMENT]: 'secondary',
  [LedgerEntryType.SALARY]: 'default',
};

/** 
 * Sign of each entry type (positive = money in, negative = money out).
 * Use this to display +/- prefix in the UI.
 */
export const LEDGER_ENTRY_TYPE_SIGN: Record<LedgerEntryType, 1 | -1> = {
  [LedgerEntryType.EARNING]: 1,
  [LedgerEntryType.PAYOUT]: -1,
  [LedgerEntryType.ADVANCE]: -1,
  [LedgerEntryType.DEDUCTION]: -1,
  [LedgerEntryType.ADJUSTMENT]: 1,
  [LedgerEntryType.SALARY]: 1,
};
